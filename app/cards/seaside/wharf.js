Wharf = class Wharf extends Card {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)

    game.turn.buys += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy`)
    return 'duration'
  }

  duration(game, player_cards, duration_card) {
    _.times(duration_card.duration_effect_count, () => {
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(2, false)
      game.turn.buys += 1
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> draws 2 cards and gets +1 buy from ${CardView.render(duration_card)}`)
    })
  }

}
