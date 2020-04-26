Template.registerHelper('times', function (times) {
  if (times !== undefined) {
    return _.times(times, function(counter) {
      return counter + 1
    })
  } else {
    return []
  }
})

Template.registerHelper('empty', function (collection) {
  return collection.count() === 0
})

Template.registerHelper('unstyled_username', function (player) {
  if (player.unstyled_username) {
    return player.unstyled_username
  } else {
    return player.username
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

Template.registerHelper('allow_villagers', function () {
  let game = Games.findOne(Router.current().params.id)
  return _.includes(['action'], game.turn.phase)
})

Template.registerHelper('allow_treasures', function () {
  let game = Games.findOne(Router.current().params.id)
  return _.includes(['action', 'treasure'], game.turn.phase)
})

Template.registerHelper('allow_debt', function () {
  let game = Games.findOne(Router.current().params.id)
  return _.includes(['action', 'treasure', 'buy'], game.turn.phase)
})

Template.registerHelper('static_image', function (name) {
  return `${Meteor.settings.public.static.cards}${name}.jpg`
})
