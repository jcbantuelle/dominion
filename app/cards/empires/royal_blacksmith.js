RoyalBlacksmith = class RoyalBlacksmith extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 0
  }

  debt_cost() {
    return 8
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(5)

    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal('hand')

    let coppers = _.filter(player_cards.hand, function(card) {
      return card.name === 'Copper'
    })
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', coppers)
    card_discarder.discard()
  }

}
