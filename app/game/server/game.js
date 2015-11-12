Meteor.methods({
  sendGameMessage: function(message, game_id) {
    let player_ids = _.pluck(game(game_id).players, '_id')
    Streamy.sessionsForUsers(player_ids).emit('game_message', {
      username: Meteor.user().username,
      message: message
    })
  },
  playCard: function(card_name, game_id) {
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock[game_id]) {
        ActionLock[game_id] = true
        let card_player = new CardPlayer(game(game_id), player_cards(game_id), card_name)
        card_player.play()
        ActionLock[game_id] = false
      }
    })).detach()
  },
  buyCard: function(card_name, game_id) {
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock[game_id]) {
        ActionLock[game_id] = true
        let card_buyer = new CardBuyer(game(game_id), player_cards(game_id), card_name)
        card_buyer.buy()
        ActionLock[game_id] = false
      }
    })).detach()
  },
  endTurn: function(game_id) {
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock[game_id]) {
        ActionLock[game_id] = true
        let turn_ender = new TurnEnder(game(game_id), player_cards(game_id))
        turn_ender.end_turn()
        ActionLock[game_id] = false
      }
    })).detach()
  },
  playAllCoin: function(game_id) {
    let current_game = game()
    if (!ActionLock[game_id]) {
      ActionLock[game_id] = true
      let all_coin_player = new AllCoinPlayer(game(game_id), player_cards(game_id))
      all_coin_player.play()
      ActionLock[game_id] = false
    }
  },
  turnEvent: function(selected_cards, turn_event_id) {
    TurnEventFutures[turn_event_id].return(selected_cards)
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

function player_cards(game_id) {
  return PlayerCards.findOne({
    game_id: game_id,
    player_id: Meteor.userId()
  })
}

function game(game_id) {
  return Games.findOne(game_id)
}
