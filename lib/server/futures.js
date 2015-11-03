Meteor.startup(function () {
  Future = Npm.require('fibers/future')
  TurnEventFutures = {}
  TurnReactionFutures = {}
})
