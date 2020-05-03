Enclave = class Enclave extends Event {

  coin_cost() {
    return 8
  }

  buy(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Gold')
    card_gainer.gain()

    let duchy = _.find(game.cards, (card) => {
      return card.name === 'Duchy'
    })
    let supply_card_exiler = new SupplyCardExiler(game, player_cards, duchy.stack_name, duchy.top_card)
    supply_card_exiler.exile()
  }

}
