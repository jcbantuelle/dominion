CityQuarter = class CityQuarter extends Card {

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
    game.turn.actions += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions`)

    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.hand)}`)

    let action_count = _.size(_.filter(player_cards.hand, function(card) {
      return _.includes(_.words(card.types), 'action')
    }))

    if (action_count > 0) {
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(action_count)
    } else {
      game.log.push(`&nbsp;&nbsp;but has no actions in hand`)
    }

  }

}
