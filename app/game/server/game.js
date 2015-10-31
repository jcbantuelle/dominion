Meteor.methods({
  sendGameMessage: function(message) {
    Streamy.sessionsForUsers(player_ids()).emit('game_message', {
      username: Meteor.user().username,
      message: message
    })
  },
  playCard: function(card_name) {
    let card_player = new CardPlayer(game(), player_cards(), card_name)
    card_player.play()
  },
  buyCard: function(card_name) {
    let card_buyer = new CardBuyer(game(), player_cards(), card_name)
    card_buyer.buy()
  },
  endTurn: function() {
    let turn_ender = new TurnEnder(game(), player_cards())
    turn_ender.end_turn()
  },
  playAllCoin: function() {
    let all_coin_player = new AllCoinPlayer(game(), player_cards())
    all_coin_player.play()
  },
  turnEvent: function(selected_cards) {
    let turn_event = TurnEvents.findOne({
      player_id: Meteor.userId()
    })
    turn_event.finished = true
    TurnEvents.update(turn_event._id, turn_event)
    TurnEventPromises[turn_event._id].resolve(selected_cards)
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
