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
    _.forIn(PlayerCards[game_id].all(), (player_cards) => {
      this.added('player_cards', player_cards._id, player_cards)
    })
  }
  Tracker.autorun(() => {
    if (PlayerCards[game_id]) {
      _.forIn(PlayerCards[game_id].all(), (player_cards) => {
        this.changed('player_cards', player_cards._id, player_cards)
      })
    }
  })
  this.ready()
})

Meteor.publish('turn_events', function(game_id) {
  Tracker.autorun(() => {
    if (TurnEvents[game_id]) {
      let existing_event_ids = _.keys(this._documents.turn_events)
      let turn_event_ids = _.keys(TurnEvents[game_id].all())

      let events_to_remove = _.difference(existing_event_ids, turn_event_ids)
      _.each(events_to_remove, (turn_event_id) => {
        this.removed('turn_events', turn_event_id)
      })

      let events_to_add = _.difference(turn_event_ids, existing_event_ids)
      _.each(events_to_add, (turn_event_id) => {
        this.added('turn_events', turn_event_id, TurnEvents[game_id].get(turn_event_id))
      })
    }
  })
  this.ready()
})

Meteor.publish('players', function() {
  return Meteor.users.find()
})

Meteor.publish('game_history', function(username) {
  let query = {}
  if (username) {
    query['players.username'] = username
  }
  return GameHistory.find(query, {
    sort: {created_at: -1},
    limit: 10
  })
})

Meteor.publish('player_rankings', function() {
  return PlayerRankings.find()
})

Meteor.publish('proposal', function() {
  return ProposalModel.find({'players._id': this.userId})
})
