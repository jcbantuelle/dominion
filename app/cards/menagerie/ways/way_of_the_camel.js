WayOfTheCamel = class WayOfTheCamel extends Way {

  play(game, player_cards) {
    let gold = _.find(game.cards, (card) => {
      return card.name === 'Gold'
    })
    let supply_card_exiler = new SupplyCardExiler(game, player_cards, gold.stack_name, gold.top_card)
    supply_card_exiler.exile()
  }

}
