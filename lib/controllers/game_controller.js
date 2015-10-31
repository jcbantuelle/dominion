GameController = LoggedInController.extend({

  waitOn: function() {
    return [
      Meteor.subscribe('game'),
      Meteor.subscribe('player_cards'),
      Meteor.subscribe('turn_event')
    ]
  }

})
