Meteor.subscribe('game')
Meteor.subscribe('player_cards')
Meteor.subscribe('turn_event')

Template.game.onCreated(pageSetup)
Template.game.onRendered(createPopovers)

Template.log.onRendered(scrollGameLog)

Template.turn_actions.helpers({
  allow_treasures: function() {
    let game = Games.findOne(Router.current().params.id)
    return _.contains(['action', 'treasure'], game.turn.phase)
  }
})

Template.game.helpers({
  game: function () {
    return Games.findOne(Router.current().params.id, {
      transform: function(game) {
        game.kingdom_cards = _.sortBy(game.kingdom_cards, function(card) {
          return -(card.top_card.coin_cost + (card.top_card.potion_cost * .1))
        })
        return game
      }
    })
  },
  player_cards: function() {
    return PlayerCards.findOne({
      game_id: Router.current().params.id,
      player_id: Meteor.userId()
    }, {
      transform: function(cards) {
        cards.discard = _.size(cards.discard)
        cards.deck = _.size(cards.deck)
        cards.hand = _.chain(cards.hand).sortBy(function(card) {
            return card.name
          }).groupBy(function(card) {
              return card.name
          }).map(function(grouped_cards, name) {
            let card = _.first(grouped_cards)
            card.count = _.size(grouped_cards)
            return card
          }).value()
        return cards
      }
    })
  },
  turn_event: function () {
    return TurnEvents.findOne()
  }
})

Template.game.events({
  "submit #chat": sendMessage,
  "click #hand .card": playCard,
  "click .card-container .card": buyCard,
  "click #end-turn": endTurn,
  "click #play-all-coin": playAllCoin,
  "submit #turn-event": turnEvent
})

function pageSetup() {
  registerStreams()
}

function registerStreams() {
  Streamy.on('game_message', updateChatWindow)
}

function createPopovers() {
  $('body').popover({
    selector: '.card-container .card, .hand-card, .prize-card',
    html: true,
    content: function() {
      return $(this).next('.card-tooltip').html()
    },
    trigger: 'hover'
  })
}

function scrollGameLog() {
  let game_log = $('#game-log')
  game_log.scrollTop(game_log[0].scrollHeight)
}

function updateChatWindow(data) {
  let chat_window = $('#game-chat')
  chat_window.append(`<strong>${data.username}:</strong> ${data.message}\n`)
  chat_window.scrollTop(chat_window[0].scrollHeight)
}

function sendMessage(event) {
  event.preventDefault()
  Meteor.call('sendGameMessage', event.target.message.value)
  event.target.message.value = ''
}

function playCard(event) {
  $('.popover').remove()
  Meteor.call('playCard', $(event.target).attr('data-name'))
}

function buyCard(event) {
  $('.popover').remove()
  Meteor.call('buyCard', $(event.target).attr('data-name'))
}

function endTurn(event) {
  Meteor.call('endTurn')
}

function playAllCoin(event) {
  Meteor.call('playAllCoin')
}

function turnEvent(event) {
  event.preventDefault()
  let turn_event = TurnEvents.findOne()

  let selected_checkboxes = $('#turn-event').find(':checked')
  if (turn_event.maximum > 0 && selected_checkboxes.length > turn_event.maximum) {
    alert(`You can select no more than ${turn_event.maximum} card(s)`)
  } else if (turn_event.minimum > 0 && selected_checkboxes.length < turn_event.minimum) {
    alert(`You must select at least ${turn_event.minimum} card(s)`)
  } else {
    let selected_cards = selected_checkboxes.map(function() {
      let card_name = $(this).val()
      return _.find(turn_event.cards, function(card) {
        return card.top_card.name === card_name
      })
    }).get()
    Meteor.call('turnEvent', selected_cards)
  }
}
