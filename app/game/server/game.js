UserStatus.events.on('connectionLogout', function(player) {
  let user = Meteor.users.findOne(player.userId)
  if (user.current_game) {
    player_connection_message(user.current_game, user.username, 'left')
  }
})

Meteor.methods({
  sendGameMessage: function(message, game_id) {
    let player_ids = _.map(game(game_id).players, '_id')
    Streamy.sessionsForUsers(player_ids).emit('game_message', {
      username: Meteor.user().username,
      message: message
    })
  },
  joinGame: function(game_id) {
    if (Meteor.user()) {
      player_connection_message(game_id, Meteor.user().username, 'joined')
    }
  },
  leftGame: function(game_id) {
    if (Meteor.user()) {
      player_connection_message(game_id, Meteor.user().username, 'left')
    }
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
            // snapshot()
          }
          ActionLock[game_id] = false
        }
      }
    })).detach()
  },
  buyEvent: function(card_name, game_id) {
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock[game_id]) {
        let current_game = game(game_id)
        if (allowed_to_play(current_game)) {
          ActionLock[game_id] = true
          let current_player_cards = player_cards(current_game)
          let event_buyer = new EventBuyer(current_game, current_player_cards, card_name)
          event_buyer.buy()
          if (current_game.turn.buys === 0) {
            let turn_ender = new TurnEnder(current_game, current_player_cards)
            turn_ender.end_turn()
            // snapshot()
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
          // snapshot()
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
  playCoinToken: function(game_id) {
    if (!ActionLock[game_id]) {
      let current_game = game(game_id)
      if (allowed_to_play(current_game)) {
        ActionLock[game_id] = true
        let coin_token_player = new CoinTokenPlayer(current_game, player_cards(current_game))
        coin_token_player.play()
        ActionLock[game_id] = false
      }
    }
  },
  turnEvent: function(selected_cards, turn_event_id) {
    TurnEventFutures[turn_event_id].return(selected_cards)
  },
  destroyGame: function() {
    if (Meteor.user().admin) {
      Meteor.users.update({}, {$unset: {current_game: ''}}, {multi: true})
      PlayerCardsModel.remove()
      GameModel.remove()
      TurnEventModel.remove()
    }
  }
})

function player_cards(game) {
  return PlayerCardsModel.findOne(game._id, game.turn.player._id)
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

function snapshot() {
  GamesSnapshot.upsert('games_snapshot', {_id: 'games_snapshot', games: Games.all()}, {}, function() {
    let player_card_snapshot = _.reduce(PlayerCards, function(snapshot, card_set, game_id) {
      snapshot[game_id] = card_set.all()
      return snapshot
    }, {})
    PlayerCardsSnapshot.upsert('player_cards_snapshot', {_id: 'player_cards_snapshot', games: player_card_snapshot})
  })
}

function player_connection_message(game_id, username, direction) {
  let game = GameModel.findOne(game_id)
  if (game) {
    let player_ids = _.map(game.players, '_id')
    Streamy.sessionsForUsers(player_ids).emit('game_message', {
      message: `<em>${username} has ${direction} the game</em>`
    })
  }
}
