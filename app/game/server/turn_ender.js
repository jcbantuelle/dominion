TurnEnder = class TurnEnder {

  constructor() {
    this.game = Games.findOne(Meteor.user().current_game)
    this.player_cards = PlayerCards.findOne({
      player_id: Meteor.userId(),
      game_id: this.game._id
    })
  }

  end_turn() {
    this.clean_up_cards_in_play()
    this.discard_hand()
    this.draw_new_hand()
    this.set_next_turn()
    this.update_log()
    if (this.game_over()) {
      this.end_game()
    }
    Games.update(this.game._id, this.game)
    PlayerCards.update(this.player_cards._id, this.player_cards)
  }

  clean_up_cards_in_play() {
    this.player_cards.discard = this.player_cards.discard.concat(this.player_cards.in_play)
    this.player_cards.in_play = []
  }

  discard_hand() {
    this.player_cards.discard = this.player_cards.discard.concat(this.player_cards.hand)
    this.player_cards.hand = []
  }

  draw_new_hand() {
    let card_drawer = new CardDrawer(this.player_cards, this.game);
    [this.player_cards, this.game] = card_drawer.draw(5)
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

  update_log() {
    this.game.log.push(`<strong>${Meteor.user().username}</strong> ends their turn`)
    if (!this.game_over()) {
      this.game.log.push(`<strong>- ${this.game.turn.player.username}'s turn ${this.player_turn_number()} -</strong>`)
    }
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
