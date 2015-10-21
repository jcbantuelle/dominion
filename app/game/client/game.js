Meteor.subscribe('game')
Meteor.subscribe('player_cards')

Template.game.onCreated(pageSetup)
Template.game.onRendered(configureTracker)

Template.game.helpers({
  game: function () {
    return Games.findOne(Router.current().params.id, {
      transform: function(game) {
        game.kingdom_cards = _.sortBy(game.kingdom_cards, function(card) {
          return card.top_card.coin_cost + (card.top_card.potion_cost * .1)
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
        cards.hand = _.chain(cards.hand).groupBy(function(card) {
              return card.name
          }).map(function(grouped_cards, name) {
            let card = _.first(grouped_cards)
            card.count = _.size(grouped_cards)
            return card
          }).value()
        return cards
      }
    })
  }
})

Template.game.events({
  "submit #chat": sendMessage,
  "click #hand .card": playCard,
  "click .card-container .card": buyCard
})

function pageSetup() {
  registerStreams()
}

function registerStreams() {
  Streamy.on('game_message', updateChatWindow)
}

function configureTracker() {
  Tracker.autorun(function () {
    managePopovers()
  })
}

function managePopovers() {
  $('body').popover('destroy')
  $('body').popover({
    selector: '.card-container .card, .hand-card, .prize-card',
    html: true,
    content: function() {
      return $(this).next('.card-tooltip').html()
    },
    trigger: 'hover'
  })
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
  Meteor.call('playCard', $(event.target).data('name'))
}

function buyCard(event) {
  Meteor.call('buyCard', $(event.target).data('name'))
}
