Silver = class Silver extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 3
  }

  play() {
    this.game = Games.findOne(Meteor.user().current_game)
    this.game.turn.coins += 2
    Games.update(this.game._id, this.game)
  }

}
