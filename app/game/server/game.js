Meteor.publish('game', function() {
  return Games.find({'players._id': this.userId})
})

Meteor.publish('player_cards', function() {
  return PlayerCards.find({'player_id': this.userId})
})

Meteor.methods({
  sendGameMessage: function(message) {
    Streamy.sessionsForUsers(player_ids()).emit('game_message', {
      username: Meteor.user().username,
      message: message
    })
  },
  playCard: function(card_name) {
    card_player = new CardPlayer(card_name)
    card_player.play()
  },
  buyCard: function(card_name) {
    card_buyer = new CardBuyer(card_name)
    card_buyer.buy()
  },
  endTurn: function() {
    turn_ender = new TurnEnder()
    turn_ender.end_turn()
  }
})

function players() {
  return Games.findOne(Meteor.user().current_game).players
}

function player_ids() {
  return _.map(players(), function(player) {
    return player._id
  })
}
