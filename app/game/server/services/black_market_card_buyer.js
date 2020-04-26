BlackMarketCardBuyer = class BlackMarketCardBuyer extends CardBuyer{

  constructor(game, player_cards) {
    super(game, player_cards)
    this.black_market = true
    this.game.revealed_black_market = game.black_market_deck.splice(0, 3)
  }

  purchasable_cards() {
    return _.filter(this.game.revealed_black_market, (card) => {
      this.card = card
      return this.can_buy()
    })
  }

  buy_from_black_market(card) {
    this.card_gainer = new CardGainer(this.game, this.player_cards, 'discard', card.name, true)
    this.card = card
    this.game_card = card
    this.buy()
  }

  return_unpurchased_cards() {
    if (_.size(this.game.revealed_black_market) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: this.game._id,
        player_id: this.player_cards.player_id,
        username: this.player_cards.username,
        type: 'sort_cards',
        instructions: `Choose order to put cards on bottom of ${CardView.render(new BlackMarket())} deck: (rightmost will be bottom)`,
        cards: this.game.revealed_black_market
      })
      let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id)
      turn_event_processor.process(BlackMarketCardBuyer.replace_revealed)
    } else {
      BlackMarketCardBuyer.replace_revealed(this.game, this.player_cards, this.game.revealed_black_market)
    }
  }

  static replace_revealed(game, player_cards, ordered_cards) {
     _.each(ordered_cards, function(ordered_card) {
      let revealed_card_index = _.findIndex(game.revealed_black_market, function(card) {
        return card.id === ordered_card.id
      })
      let revealed_card = game.revealed_black_market.splice(revealed_card_index, 1)[0]
      game.black_market_deck.push(revealed_card)
    })
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places the remaining cards on the bottom of the ${CardView.render(new BlackMarket())} deck`)
  }

}
