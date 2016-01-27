EventBuyer = class EventBuyer {

  constructor(game, player_cards, card_name) {
    this.game = game
    this.player_cards = player_cards
    this.event = ClassCreator.create(card_name)
  }

  buy() {
    if (this.is_valid_buy()) {
      this.update_phase()
      this.buy_event()
      GameModel.update(this.game._id, this.game)
      PlayerCardsModel.update(this.game._id, this.player_cards)
    }
  }

  update_phase() {
    if (_.contains(['action', 'treasure'], this.game.turn.phase)) {
      this.game.turn.phase = 'buy'
    }
  }

  buy_event() {
    this.update_turn()
    this.update_log()
    this.event.buy(this.game, this.player_cards)
  }

  update_turn() {
    this.game.turn.buys -= 1
    this.game.turn.coins -= this.event.coin_cost()
  }

  is_valid_buy() {
    return this.has_enough_buys() && this.has_enough_money() && this.not_forbidden()
  }

  has_enough_buys() {
    return this.game.turn.buys > 0
  }

  has_enough_money() {
    return this.game.turn.coins >= this.event.coin_cost()
  }

  not_forbidden() {
    return !_.contains(this.game.turn.forbidden_events, this.event.name()) && !(this.event.name() === 'Inheritance' && this.player_cards.tokens.estate)
  }

  update_log() {
    this.game.log.push(`<strong>${this.player_cards.username}</strong> buys ${CardView.render(this.event)}`)
  }

}
