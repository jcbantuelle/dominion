Festival = class Festival extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play() {
    this.game = Games.findOne(Meteor.user().current_game)

    this.game.turn.actions += 2
    this.game.turn.buys += 1
    this.game.turn.coins += 2
    this.game.log.push(`&nbsp;&nbsp;<strong>${Meteor.user().username}</strong> gets +2 actions, +1 buy, and +$2`)
    Games.update(this.game._id, this.game)
  }

}
