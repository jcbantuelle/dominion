Template.game.onCreated(registerStreams)
Template.game.onRendered(createPopovers)

Template.log.onRendered(scrollGameLog)

Template.turn_actions.helpers({
  allow_treasures: function() {
    let game = Games.findOne(Router.current().params.id)
    return _.contains(['action', 'treasure'], game.turn.phase)
  }
})

Template.game.events({
  "submit #chat": sendMessage,
  "click #hand .card": playCard,
  "click .card-container .card": buyCard,
  "click #end-turn": endTurn,
  "click #play-all-coin": playAllCoin,
  "submit #turn-event": turnEvent,
  "click #destroy-game": destroyGame,
  "click": removePopover,
})

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
  Meteor.call('playCard', $(event.target).attr('data-name'))
}

function buyCard(event) {
  Meteor.call('buyCard', $(event.target).attr('data-name'))
}

function endTurn() {
  Meteor.call('endTurn')
}

function playAllCoin() {
  Meteor.call('playAllCoin')
}

function turnEvent(event) {
  event.preventDefault()
  let turn_event = TurnEvents.findOne()
  let selected_checkboxes = $('#turn-event').find(':checked')

  let turn_event_submission = new TurnEventSubmission(turn_event, selected_checkboxes)
  if (turn_event_submission.valid_selection()) {
    Meteor.call('turnEvent', turn_event_submission.selected_values())
  } else {
    alert(turn_event_submission.error_message())
  }
}

function destroyGame() {
  Meteor.call('destroyGame')
}

function removePopover() {
  $('.popover').remove()
}
