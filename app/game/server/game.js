Meteor.publish('game', function() {
  return Games.find({'players._id': this.userId})
})

Meteor.publish('player_cards', function() {
  return PlayerCards.find({'player_id': this.userId})
})

Meteor.publish('turn_event', function() {
  return TurnEvents.find({'player_id': this.userId})
})

const bulk_playable_treasures = ['Copper', 'Silver', 'Gold']

Meteor.methods({
  sendGameMessage: function(message) {
    Streamy.sessionsForUsers(player_ids()).emit('game_message', {
      username: Meteor.user().username,
      message: message
    })
  },
  playCard: function(card_name) {
    play_card(card_name)
  },
  buyCard: function(card_name) {
    let card_buyer = new CardBuyer(card_name)
    card_buyer.buy()
  },
  endTurn: function() {
    let turn_ender = new TurnEnder()
    turn_ender.end_turn()
  },
  playAllCoin: function() {
    let player_cards = PlayerCards.findOne({
      game_id: Meteor.user().current_game,
      player_id: Meteor.userId()
    })

    _.chain(player_cards.hand).filter(function(card) {
      return _.contains(bulk_playable_treasures, card.name)
    }).each(function(card) {
      play_card(card.name)
    }).value()
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
  return Games.findOne(Meteor.user().current_game).players
}

function player_ids() {
  return _.map(players(), function(player) {
    return player._id
  })
}

function play_card(card_name) {
  let card_player = new CardPlayer(card_name)
  card_player.play()
}
