Template.registerHelper('times', function (times) {
  if (times !== undefined) {
    return _.times(times, function(counter) {
      return counter
    })
  } else {
    return []
  }
})

Template.registerHelper('my_turn', function () {
  let game = Games.findOne(Router.current().params.id)
  if (game.turn.possessed) {
    return game.turn.possessed._id === Meteor.userId()
  } else {
    return game.turn.player._id === Meteor.userId()
  }
})
