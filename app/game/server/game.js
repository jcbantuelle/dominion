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
        let current_game = game(game_id)
        if (allowed_to_play(current_game)) {
          ActionLock[game_id] = true
          let card_player = new CardPlayer(current_game, player_cards(current_game), card_name)
          card_player.play()
          ActionLock[game_id] = false
        }
      }
    })).detach()
  },
  buyCard: function(card_name, game_id) {
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock[game_id]) {
        let current_game = game(game_id)
        if (allowed_to_play(current_game)) {
          ActionLock[game_id] = true
          let current_player_cards = player_cards(current_game)
          let card_buyer = new CardBuyer(current_game, current_player_cards, card_name)
          card_buyer.buy()
          if (current_game.turn.buys === 0) {
            let turn_ender = new TurnEnder(current_game, current_player_cards)
            turn_ender.end_turn()
          }
          ActionLock[game_id] = false
        }
      }
    })).detach()
  },
  endTurn: function(game_id) {
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock[game_id]) {
        let current_game = game(game_id)
        if (allowed_to_play(current_game)) {
          ActionLock[game_id] = true
          let turn_ender = new TurnEnder(current_game, player_cards(current_game))
          turn_ender.end_turn()
          ActionLock[game_id] = false
        }
      }
    })).detach()
  },
  playAllCoin: function(game_id) {
    if (!ActionLock[game_id]) {
      let current_game = game(game_id)
      if (allowed_to_play(current_game)) {
        ActionLock[game_id] = true
        let all_coin_player = new AllCoinPlayer(current_game, player_cards(current_game))
        all_coin_player.play()
        ActionLock[game_id] = false
      }
    }
  },
  turnEvent: function(selected_cards, turn_event_id) {
    TurnEventFutures[turn_event_id].return(selected_cards)
  },
  destroyGame: function() {
    if (Meteor.user().admin) {
      PlayerCardsModel.remove()
      GameModel.remove()
      TurnEventModel.remove()
      Meteor.users.update({}, {$unset: {current_game: ''}}, {multi: true})
    }
  }
})

function player_cards(game) {
  return PlayerCardsModel.findOne({
    game_id: game._id,
    player_id: game.turn.player._id
  })
}

function game(game_id) {
  return GameModel.findOne(game_id)
}

function allowed_to_play(game) {
  if (game.turn.possessed) {
    return Meteor.userId() === game.turn.possessed._id
  } else {
    return Meteor.userId() === game.turn.player._id
  }
}
