Moat = class Moat extends Card {

  types() {
    return ['action', 'reaction']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)
  }

  attack_event(game, player_cards, card_name = 'Moat') {
    let revealed_card = this
    if (card_name === 'Estate') {
      revealed_card = _.find(player_cards.hand, function(card) {
        return card.name === 'Estate'
      })
    }
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(revealed_card)}`)
    player_cards.moat = true
  }

}
