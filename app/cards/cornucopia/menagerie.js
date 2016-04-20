Menagerie = class Menagerie extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.hand)}`)

    let unique_cards = _.uniqBy(player_cards.hand, 'name')

    let card_count = _.size(unique_cards) === _.size(player_cards.hand) ? 3 : 1

    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(card_count)
  }

}
