BlackMarketCardBuyer = class BlackMarketCardBuyer extends CardBuyer{

  constructor(game, player_cards) {
    super(game, player_cards)
    this.game_card = this.game.black_market_bought_card
    this.card = ClassCreator.create(this.game_card.name)
    this.card_gainer = new CardGainer(this.game, this.player_cards, 'discard', this.game_card.name, true)
  }

  can_buy() {
    return true
  }

  update_phase() {
  }

  update_turn() {
    this.game.turn.coins -= CostCalculator.calculate(this.game, this.game_card, true)
    this.game.turn.potions -= this.game_card.potion_cost
    this.player_cards.debt_tokens += this.game_card.debt_cost
  }

  track_bought_card() {
    let bought_card = _.clone(this.game_card)
    this.game.turn.bought_cards.push(bought_card)
  }

  gain_card() {
    this.card_gainer.gain(this.game.black_market)
  }

}
