Gold = class Gold extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 6
  }

  play() {
    this.game = Games.findOne(Meteor.user().current_game)
    this.game.turn.coins += 3
    Games.update(this.game._id, this.game)
  }

}
