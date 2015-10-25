Woodcutter = class Woodcutter extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    game.turn.buys += 1
    game.turn.coins += 2
    game.log.push(`&nbsp;&nbsp;<strong>${Meteor.user().username}</strong> gets +1 buy and +$2`)
    Games.update(game._id, game)
  }

}
