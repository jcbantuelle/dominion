EventBuyer = class EventBuyer {

  constructor(game, player_cards, card_name) {
    this.game = game
    this.player_cards = player_cards
    this.event = ClassCreator.create(card_name)
  }

  buy() {
    if (this.is_valid_buy()) {
      this.update_phase()
      this.track_bought_card()
      this.buy_event()
      GameModel.update(this.game._id, this.game)
      PlayerCardsModel.update(this.game._id, this.player_cards)
    }
  }

  update_phase() {
    if (_.includes(['action', 'treasure'], this.game.turn.phase)) {
      this.game.turn.phase = 'treasure'
      let start_buy_event_processor = new StartBuyEventProcessor(this.game, this.player_cards)
      start_buy_event_processor.process()
      this.game.turn.phase = 'buy'
    }
  }

  track_bought_card(card) {
    let bought_card = _.clone(this.event.to_h())
    this.game.turn.bought_things.push(bought_card)
  }

  buy_event() {
    this.update_log()
    this.update_turn()
    this.event.buy(this.game, this.player_cards)
  }

  update_turn() {
    this.game.turn.buys -= 1
    this.game.turn.coins -= this.event.coin_cost()
    if (this.event.debt_cost() > 0) {
      let debt_token_gainer = new DebtTokenGainer(this.game, this.player_cards)
      debt_token_gainer.gain(this.event.debt_cost())
    }
  }

  is_valid_buy() {
    return this.is_debt_free() && this.has_enough_buys() && this.has_enough_money() && this.not_forbidden()
  }

  is_debt_free() {
    return this.player_cards.debt_tokens === 0
  }

  has_enough_buys() {
    return this.game.turn.buys > 0
  }

  has_enough_money() {
    return this.game.turn.coins >= this.event.coin_cost()
  }

  not_forbidden() {
    return !_.includes(this.game.turn.forbidden_events, this.event.name()) && !(this.event.name() === 'Inheritance' && !_.isEmpty(this.player_cards.inheritance)) && !(this.event.name() === 'Seize The Day' && this.player_cards.seize_the_day)
  }

  update_log() {
    this.game.log.push(`<strong>${this.player_cards.username}</strong> buys ${CardView.render(this.event)}`)
  }

}
