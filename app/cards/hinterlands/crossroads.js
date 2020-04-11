Crossroads = class Crossroads extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards, player) {
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.hand)}`)

    let victory_cards = _.filter(player_cards.hand, function(card) {
      return _.includes(_.words(card.types), 'victory')
    })
    if (_.size(victory_cards) > 0) {
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(_.size(victory_cards))
    }

    let played_crossroads = _.filter(game.turn.played_actions, (card) => {
      return card.name === 'Crossroads'}
    )
    if (_.size(played_crossroads) === 1) {
      game.turn.actions += 3
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +3 actions`)
    }
  }

}
