Village = class Village extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(player_cards, game)
    let results = card_drawer.draw(1, true)
    player_cards = results[0]
    game = results[1]

    game.turn.actions += 2
    game.log.push(`&nbsp;&nbsp;<strong>${Meteor.user().username}</strong> gets +1 actions`)
    Games.update(game._id, game)
    PlayerCards.update(player_cards._id, player_cards)
  }

}
