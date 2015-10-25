Woodcutter = class Woodcutter extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play() {
    this.game = Games.findOne(Meteor.user().current_game)

    this.game.turn.buys += 1
    this.game.turn.coins += 2
    this.game.log.push(`&nbsp;&nbsp;<strong>${Meteor.user().username}</strong> gets +1 buy and +$2`)
    Games.update(this.game._id, this.game)
  }

}
