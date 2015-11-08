Meteor.methods({
  sendGameMessage: function(message) {
    Streamy.sessionsForUsers(player_ids()).emit('game_message', {
      username: Meteor.user().username,
      message: message
    })
  },
  playCard: function(card_name) {
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock) {
        ActionLock = true
        let card_player = new CardPlayer(game(), player_cards(), card_name)
        card_player.play()
        ActionLock = false
      }
    })).detach()
  },
  buyCard: function(card_name) {
    if (!ActionLock) {
      ActionLock = true
      let card_buyer = new CardBuyer(game(), player_cards(), card_name)
      card_buyer.buy()
      ActionLock = false
    }
  },
  endTurn: function() {
    if (!ActionLock) {
      ActionLock = true
      let turn_ender = new TurnEnder(game(), player_cards())
      turn_ender.end_turn()
      ActionLock = false
    }
  },
  playAllCoin: function() {
    if (!ActionLock) {
      ActionLock = true
      let all_coin_player = new AllCoinPlayer(game(), player_cards())
      all_coin_player.play()
      ActionLock = false
    }
  },
  turnEvent: function(selected_cards) {
    let turn_event = TurnEvents.findOne({
      player_id: Meteor.userId()
    })
    TurnEventFutures[turn_event._id].return(selected_cards)
  },
  destroyGame: function() {
    if (Meteor.user().admin) {
      PlayerCards.remove({})
      Games.remove({})
      TurnEvents.remove({})
      Meteor.users.update({}, {$unset: {current_game: ''}}, {multi: true})
    }
  }
})

function players() {
  return game().players
}

function player_ids() {
  return _.map(players(), function(player) {
    return player._id
  })
}

function player_cards() {
  return PlayerCards.findOne({
    game_id: Meteor.user().current_game,
    player_id: Meteor.userId()
  })
}

function game() {
  return Games.findOne(Meteor.user().current_game)
}
