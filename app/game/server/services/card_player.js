CardPlayer = class CardPlayer {

  constructor(game, player_cards, card_name) {
    this.card = ClassCreator.create(card_name)
    this.game = game
    this.player_cards = player_cards
    this.card_index = _.findIndex(this.player_cards.hand, (card) => {
      return card.name === this.card.name()
    })
  }

  play(auto_update = true) {
    if (this.can_play()) {
      this.update_phase()
      this.put_card_in_play()
      this.use_action()
      if (auto_update) {
        this.update_log()
        this.update_db()
      }
      this.play_card(auto_update)
    }
  }

  play_card(auto_update = true) {
    this.card.play(this.game, this.player_cards)
    if (auto_update) {
      this.update_db()
    }
    this.attack()
  }

  can_play() {
    return this.is_player_turn() && this.is_playable() && this.is_valid_play() && this.card_exists()
  }

  update_phase() {
    if (this.game.turn.phase == 'action' && _.contains(this.card.types(), 'treasure')) {
      this.game.turn.phase = 'treasure'
    }
  }

  put_card_in_play() {
    played_card = this.player_cards.hand.splice(this.card_index, 1)
    this.player_cards.in_play = this.player_cards.in_play.concat(played_card)
  }

  use_action() {
    if (_.contains(this.card.types(), 'action')) {
      this.game.turn.actions -= 1
    }
  }

  update_db(player_cards = this.player_cards) {
    Games.update(this.game._id, this.game)
    PlayerCards.update(player_cards._id, player_cards)
  }

  update_log() {
    this.game.log.push(`<strong>${Meteor.user().username}</strong> plays <span class="${this.card.type_class()}">${this.card.name()}</span>`)
  }

  is_player_turn() {
    return this.game.turn.player._id == Meteor.userId()
  }

  is_playable() {
    return typeof this.card.play === 'function'
  }

  is_valid_play() {
    if (_.contains(this.card.types(), 'action')) {
      return this.is_valid_action()
    } else if (_.contains(this.card.types(), 'treasure')) {
      return this.is_valid_treasure()
    }
  }

  is_valid_action() {
    return this.game.turn.phase == 'action' && this.game.turn.actions > 0
  }

  is_valid_treasure() {
    return _.contains(['action', 'treasure'], this.game.turn.phase)
  }

  card_exists() {
    return this.card_index !== -1
  }

  attack() {
    if (_.contains(this.card.types(), 'attack')) {
      let turn_ordered_players = TurnOrderedPlayersQuery.turn_ordered_players(this.game, Meteor.user())

      _.each(turn_ordered_players, (player) => {
        let attacked_player_cards = PlayerCards.findOne({
          game_id: this.game._id,
          player_id: player._id
        })

        let reaction_processor = new ReactionProcessor(this.game, attacked_player_cards)
        reaction_processor.process_attack_reactions()

        if (attacked_player_cards.moat) {
          delete attacked_player_cards.moat
          this.game.log.push(`&nbsp;&nbsp;<strong>${attacked_player_cards.username}</strong> is immune to the attack`)
        } else {
          this.card.attack(this.game, attacked_player_cards)
        }
        this.update_db(attacked_player_cards)
      })
    }
  }

}
