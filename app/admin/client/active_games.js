Template.activeGames.events({
  "click .destroy-game": destroyGame
})

function destroyGame(event) {
  event.preventDefault()
  Meteor.call('destroyGame', $(event.target).attr('data-game-id'))
}