Meteor.methods({
  sendGameMessage: function(message) {
    Streamy.sessionsForUsers(player_ids()).emit('game_message', {
      username: Meteor.user().username,
      message: message
    })
  },
  playCard: function(card_name) {
    let current_game = game()
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock[current_game._id]) {
        ActionLock[current_game._id] = true
        let card_player = new CardPlayer(current_game, player_cards(), card_name)
        card_player.play()
        ActionLock[current_game._id] = false
      }
    })).detach()
  },
  buyCard: function(card_name) {
    let current_game = game()
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock[current_game._id]) {
        ActionLock[current_game._id] = true
        let card_buyer = new CardBuyer(current_game, player_cards(), card_name)
        card_buyer.buy()
        ActionLock[current_game._id] = false
      }
    })).detach()
  },
  endTurn: function() {
    let current_game = game()
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock[current_game._id]) {
        ActionLock[current_game._id] = true
        let turn_ender = new TurnEnder(current_game, player_cards())
        turn_ender.end_turn()
        ActionLock[current_game._id] = false
      }
    })).detach()
  },
  playAllCoin: function() {
    let current_game = game()
    if (!ActionLock[current_game._id]) {
      ActionLock[current_game._id] = true
      let all_coin_player = new AllCoinPlayer(current_game, player_cards())
      all_coin_player.play()
      ActionLock[current_game._id] = false
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
