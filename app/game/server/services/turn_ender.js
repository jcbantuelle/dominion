TurnEnder = class TurnEnder {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
  }

  end_turn() {
    this.discard_hand()
    this.clean_up_cards_in_play()
    this.draw_new_hand()
    this.game.log.push(`<strong>${this.game.turn.player.username}</strong> ends their turn`)
    this.set_next_turn()
    if (this.game_over()) {
      this.end_game()
    } else {
      this.game.log.push(`<strong>- ${this.game.turn.player.username}'s turn ${this.player_turn_number()} -</strong>`)
      this.process_duration_cards()
    }
    Games.update(this.game._id, this.game)
    PlayerCards.update(this.player_cards._id, this.player_cards)
    PlayerCards.update(this.next_player_cards._id, this.next_player_cards)
  }

  clean_up_cards_in_play() {
    let card_discarder = new CardDiscarder(this.game, this.player_cards, 'in_play')
    card_discarder.discard_all(false)
  }

  discard_hand() {
    let card_discarder = new CardDiscarder(this.game, this.player_cards, 'hand')
    card_discarder.discard_all(false)
  }

  draw_new_hand() {
    let card_drawer = new CardDrawer(this.game, this.player_cards)
    card_drawer.draw(5, false)
  }

  set_next_turn() {
    this.game.turn = {
      player: this.next_player(),
      actions: 1,
      buys: 1,
      coins: 0,
      potions: 0,
      phase: 'action'
    }
    this.game.turn_number += 1
    this.next_player_cards = PlayerCards.findOne({
      game_id: this.game._id,
      player_id: this.game.turn.player._id
    })
  }

  process_duration_cards() {
    _.each(this.next_player_cards.duration, (player_card) => {
      let card = ClassCreator.create(player_card.name)
      if (typeof card.duration === 'function') {
        _.times(player_card.duration_effect_count, () => {
          card.duration(this.game, this.next_player_cards)
        })
      }
      this.next_player_cards.in_play.push(player_card)
    })
    this.next_player_cards.duration = []
    if (_.size(this.next_player_cards.haven) > 0) {
      this.next_player_cards.hand = this.next_player_cards.hand.concat(this.next_player_cards.haven)
      this.game.log.push(`&nbsp;&nbsp;<strong>${this.next_player_cards.username}</strong> puts ${_.size(this.next_player_cards.haven)} cards in hand from ${CardView.card_html('action duration', 'Haven')}`)
      this.next_player_cards.haven = []
    }
  }

  next_player() {
    return this.game.players[this.next_player_index()]
  }

  next_player_index() {
    return (this.current_player_index() + 1) % _.size(this.game.players)
  }

  current_player_index() {
    return _.findIndex(this.game.players, function(player) {
      return player._id === Meteor.userId()
    })
  }

  player_turn_number() {
    return Math.floor((this.game.turn_number-1) / _.size(this.game.players)) + 1
  }

  end_game() {
    let game_ender = new GameEnder(this.game)
    this.game = game_ender.end_game()
  }

  game_over() {
    return this.three_empty_stacks() || this.no_more_provinces_or_colonies()
  }

  three_empty_stacks() {
    return _.size(this.empty_stacks()) >= 3
  }

  no_more_provinces_or_colonies() {
    return _.find(this.empty_stacks(), function(game_card) {
      return game_card.name === 'Province' || game_card.name === 'Colony'
    }) !== undefined
  }

  empty_stacks() {
    return _.filter(this.game.kingdom_cards.concat(this.game.common_cards), function(game_card) {
      return game_card.count === 0
    })
  }

}
