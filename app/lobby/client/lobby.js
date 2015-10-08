Meteor.subscribe('lobby_players')

Template.lobby.onCreated(function() {
  Streamy.on('lobby_message', function(data) {
    chat_window = $('#lobby-chat')
    chat_window.append(`<strong>${data.username}:</strong> ${data.message}\n`)
    chat_window.scrollTop(chat_window[0].scrollHeight)
  })
})

Template.lobby.helpers({
  lobby_players: function () {
    return Meteor.users.find({_id: {$ne: Meteor.userId()}})
  }
})

Template.lobby.events({
  "submit #chat": function (event) {
    event.preventDefault()
    Streamy.broadcast('lobby_message', {
      username: Meteor.user().username,
      message: event.target.message.value
    })
    event.target.message.value = ''
  }
})
