Meteor.publish('games', function(game_id) {
  check(game_id, String)
  this.added("games", game_id, Games.get(game_id))
  Tracker.autorun(() => {
    let game = Games.get(game_id)
    if (game) {
      this.changed('games', game_id, game)
    } else {
      this.removed('games', game_id)
    }
  })
  this.ready()
})

Meteor.publish('player_cards', function(game_id) {
  if (PlayerCards[game_id]) {
    _.forIn(PlayerCards[game_id].all(), (player_cards, player_id) => {
      this.added('player_cards', player_id, player_cards)
    })
  }
  Tracker.autorun(() => {
    if (PlayerCards[game_id]) {
      _.forIn(PlayerCards[game_id].all(), (player_cards, player_id) => {
        this.changed('player_cards', player_id, player_cards)
      })
    }
  })
  this.ready()
})

Meteor.publish('turn_events', function(game_id) {
  this.added('turn_events', game_id, TurnEvents.get(game_id))
  Tracker.autorun(() => {
    let turn_event = TurnEvents.get(game_id)
    if (turn_event) {
      this.changed('turn_events', game_id, turn_event)
    } else {
      this.removed('turn_events', game_id)
      this.added('turn_events', game_id, turn_event)
    }
  })
  this.ready()
})

Meteor.publish('players', function() {
  return Meteor.users.find()
})

Meteor.publish('proposal', function() {
  return ProposalModel.find({'players._id': this.userId})
})
