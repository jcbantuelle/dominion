Template.game.onCreated(registerStreams)
Template.game.onRendered(createPopovers)

Template.log.onRendered(scrollGameLog)
Template.sort_cards.onRendered(addSortable)

Template.game.events({
  "submit #chat": sendMessage,
  "click #hand .card": playCard,
  "click .card-container .card": buyCard,
  "click .event-container .card": buyEvent,
  "click #end-turn": endTurn,
  "click #play-all-coin": playAllCoin,
  "click #play-coffer": playCoinToken,
  "click #play-villager": playVillager,
  "click #play-debt-token": playDebtToken,
  "submit #turn-event": turnEvent,
  "click": removePopover,
})

function registerStreams() {
  Streamy.on('game_message', updateChatWindow)
}

function createPopovers() {
  $('body').popover({
    selector: '.card-container .card, .event-container .card, .hand-card, .prize-card, .state-card, .native-village-card, .haven-card, .cargo-ship-card, .church-card, .archive-card, .crypt-card, .island-card, .tavern-card, .state-card, .artifact-card, .trash-card, .black-market-card, .choose-card, .landmark-container .card, .boon-container .card, #game-log span.card, #instructions .card, #action-response .card, #action-response span.boon, #action-response span.hex',
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

function addSortable() {
  sort_list = document.getElementById('sortable-cards')
  Sortable.create(sort_list, {
    draggable: '.ordered',
    animation: 150
  })
}

function updateChatWindow(data) {
  let chat_window = $('#game-chat')
  let message = `${data.message}\n`
  if (data.username) {
    message = `<strong>${data.username}:</strong> ${message}`
  }
  chat_window.append(message)
  chat_window.scrollTop(chat_window[0].scrollHeight)
}

function sendMessage(event) {
  event.preventDefault()
  Meteor.call('sendGameMessage', event.target.message.value, Router.current().params.id)
  event.target.message.value = ''
}

function playCard(event) {
  Meteor.call('playCard', $(event.target).attr('data-id'), Router.current().params.id)
}

function buyCard(event) {
  Meteor.call('buyCard', $(event.target).attr('data-name'), Router.current().params.id)
}

function buyEvent(event) {
  Meteor.call('buyEvent', $(event.target).attr('data-name'), Router.current().params.id)
}

function endTurn() {
  Meteor.call('endTurn', Router.current().params.id)
}

function playAllCoin() {
  Meteor.call('playAllCoin', Router.current().params.id)
}

function playCoinToken() {
  Meteor.call('playCoinToken', Router.current().params.id)
}

function playVillager() {
  Meteor.call('playVillager', Router.current().params.id)
}

function playDebtToken() {
  Meteor.call('playDebtToken', Router.current().params.id)
}

function turnEvent(event) {
  event.preventDefault()

  let turn_event = TurnEvents.findOne()
  let selection
  if (turn_event.type === 'sort_cards') {
    selection = $('#turn-event input').map(function() {
      return $(this).val()
    }).get()
  } else if (turn_event.type === 'overpay') {
    selection = $('#overpay-input').val()
  } else {
    selection = $('#turn-event').find(':checked')
  }

  let turn_event_submission = new TurnEventSubmission(turn_event, selection)
  if (turn_event_submission.valid_selection()) {
    $('#turn-event input:checkbox').prop('checked', false)
    $('#turn-event #overpay-input').val('')
    Meteor.call('turnEvent', turn_event_submission.selected_values(), turn_event._id)
  } else {
    alert(turn_event_submission.error_message())
  }

}

function removePopover() {
  $('.popover').remove()
}
