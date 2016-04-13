ShantyTown = class ShantyTown extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    game.turn.actions += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions`)

    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.hand)}`)

    let has_actions = _.some(player_cards.hand, function(card) {
      return _.includes(_.words(card.types), 'action')
    })
    if (!has_actions) {
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(2)
    }
  }

}
