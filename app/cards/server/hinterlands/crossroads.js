Crossroads = class Crossroads extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.hand)}`)

    let victory_cards = _.filter(player_cards.hand, function(card) {
      return _.contains(card.types, 'victory')
    })
    if (_.size(victory_cards) > 0) {
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(_.size(victory_cards))
    }

    if (!game.turn.crossroads) {
      game.turn.actions += 3
      game.turn.crossroads = true
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +3 actions`)
    }
  }

}
