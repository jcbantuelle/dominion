Copper = class Copper extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 0
  }

  play() {
    this.game = Games.findOne(Meteor.user().current_game)
    this.game.turn.coins += 1
    Games.update(this.game._id, this.game)
  }

}
