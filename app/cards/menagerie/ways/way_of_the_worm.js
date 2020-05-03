WayOfTheWorm = class WayOfTheWorm extends Way {

  play(game, player_cards) {
    let estate = _.find(game.cards, (card) => {
      return card.name === 'Estate'
    })
    let supply_card_exiler = new SupplyCardExiler(game, player_cards, estate.stack_name, estate.top_card)
    supply_card_exiler.exile()
  }

}
