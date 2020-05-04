Meteor.methods({
  sendGameMessage: function(message, game_id) {
    let player_ids = _.map(game(game_id).players, '_id')
    Streamy.sessionsForUsers(player_ids).emit('game_message', {
      username: Meteor.user().username,
      message: message
    })
  },
  playCard: function(card_id, game_id) {
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock[game_id]) {
        ActionLock[game_id] = true
        let current_game = game(game_id)
        if (allowed_to_play(current_game)) {
          let current_player_cards = player_cards(current_game)
          PlayerActionUndoer.track_action(current_game, current_player_cards)
          let card = _.find(current_player_cards.hand, (card) => {
            return card.id === card_id
          })
          if (card) {
            let card_player = new CardPlayer(current_game, current_player_cards, card)
            card_player.play()
            if (turn_over(current_game, current_player_cards)) {
              let turn_ender = new TurnEnder(current_game, current_player_cards)
              turn_ender.end_turn()
            }
          }
        }
        ActionLock[game_id] = false
      }
    })).detach()
  },
  buyCard: function(card_name, game_id) {
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock[game_id]) {
        ActionLock[game_id] = true
        let current_game = game(game_id)
        if (allowed_to_play(current_game)) {
          let current_player_cards = player_cards(current_game)
          PlayerActionUndoer.track_action(current_game, current_player_cards)
          let card_buyer = new CardBuyer(current_game, current_player_cards, card_name)
          card_buyer.buy()
          if (turn_over(current_game, current_player_cards)) {
            let turn_ender = new TurnEnder(current_game, current_player_cards)
            turn_ender.end_turn()
          }
        }
        ActionLock[game_id] = false
      }
    })).detach()
  },
  buyEvent: function(card_name, game_id) {
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock[game_id]) {
        ActionLock[game_id] = true
        let current_game = game(game_id)
        if (allowed_to_play(current_game)) {
          let current_player_cards = player_cards(current_game)
          PlayerActionUndoer.track_action(current_game, current_player_cards)
          let event_buyer = new EventBuyer(current_game, current_player_cards, card_name)
          event_buyer.buy()
          if (turn_over(current_game, current_player_cards)) {
            let turn_ender = new TurnEnder(current_game, current_player_cards)
            turn_ender.end_turn()
          }
        }
        ActionLock[game_id] = false
      }
    })).detach()
  },
  buyProject: function(card_name, game_id) {
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock[game_id]) {
        ActionLock[game_id] = true
        let current_game = game(game_id)
        if (allowed_to_play(current_game)) {
          let current_player_cards = player_cards(current_game)
          PlayerActionUndoer.track_action(current_game, current_player_cards)
          let project_buyer = new ProjectBuyer(current_game, current_player_cards, card_name)
          project_buyer.buy()
          if (turn_over(current_game, current_player_cards)) {
            let turn_ender = new TurnEnder(current_game, current_player_cards)
            turn_ender.end_turn()
          }
        }
        ActionLock[game_id] = false
      }
    })).detach()
  },
  endTurn: function(game_id) {
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock[game_id]) {
        ActionLock[game_id] = true
        let current_game = game(game_id)
        if (allowed_to_play(current_game)) {
          let turn_ender = new TurnEnder(current_game, player_cards(current_game))
          turn_ender.end_turn()
        }
        ActionLock[game_id] = false
      }
    })).detach()
  },
  playAllCoin: function(game_id) {
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock[game_id]) {
        ActionLock[game_id] = true
        let current_game = game(game_id)
        if (allowed_to_play(current_game)) {
          let current_player_cards = player_cards(current_game)
          PlayerActionUndoer.track_action(current_game, current_player_cards)
          let all_coin_player = new AllCoinPlayer(current_game, current_player_cards)
          all_coin_player.play()
        }
        ActionLock[game_id] = false
      }
    })).detach()
  },
  playCoinToken: function(game_id) {
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock[game_id]) {
        ActionLock[game_id] = true
        let current_game = game(game_id)
        if (allowed_to_play(current_game)) {
          let current_player_cards = player_cards(current_game)
          PlayerActionUndoer.track_action(current_game, current_player_cards)
          let coffer_player = new CofferPlayer(current_game, current_player_cards)
          coffer_player.play()
        }
        ActionLock[game_id] = false
      }
    })).detach()
  },
  playVillager: function(game_id) {
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock[game_id]) {
        ActionLock[game_id] = true
        let current_game = game(game_id)
        if (allowed_to_play(current_game)) {
          let current_player_cards = player_cards(current_game)
          PlayerActionUndoer.track_action(current_game, current_player_cards)
          let villager_player = new VillagerPlayer(current_game, current_player_cards)
          villager_player.play()
        }
        ActionLock[game_id] = false
      }
    })).detach()
  },
  playDebtToken: function(game_id) {
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock[game_id]) {
        ActionLock[game_id] = true
        let current_game = game(game_id)
        if (allowed_to_play(current_game)) {
          let current_player_cards = player_cards(current_game)
          PlayerActionUndoer.track_action(current_game, current_player_cards)
          let debt_token_player = new DebtTokenPlayer(current_game, current_player_cards)
          debt_token_player.play()
          if (turn_over(current_game, current_player_cards)) {
            let turn_ender = new TurnEnder(current_game, current_player_cards)
            turn_ender.end_turn()
          }
        }
        ActionLock[game_id] = false
      }
    })).detach()
  },
  undoAction: function(game_id) {
    Future.task(Meteor.bindEnvironment(function() {
      if (!ActionLock[game_id]) {
        ActionLock[game_id] = true
        let current_game = game(game_id)
        if (allowed_to_play(current_game)) {
          let current_player_cards = player_cards(current_game)
          PlayerActionUndoer.undo_action(current_game, current_player_cards)
        }
        ActionLock[game_id] = false
      }
    })).detach()
  },
  turnEvent: function(selected_cards, turn_event_id) {
    TurnEventFutures[turn_event_id].return(selected_cards)
  }
})

function turn_over(game, player_cards) {
  if (game.turn.phase === 'buy') {
    return game.turn.buys === 0 && (player_cards.debt_tokens === 0 || game.turn.coins === 0) && !has_night_cards(player_cards)
  } else if (game.turn.phase === 'night') {
    return !has_night_cards(player_cards)
  } else {
    return false
  }
}

function has_night_cards(player_cards) {
  return _.some(player_cards.hand, function(card) {
    return _.includes(_.words(card.types), 'night')
  })
}

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
