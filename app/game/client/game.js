Meteor.subscribe('game')

Template.game.onCreated(registerStreams)

Template.game.helpers({
  game: function () {
    return Games.findOne()
  }
})

Template.game.events({
  "submit #chat": sendMessage
})

function registerStreams() {
  Streamy.on('game_message', updateChatWindow)
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
