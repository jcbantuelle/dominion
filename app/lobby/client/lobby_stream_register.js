LobbyStreamRegister = class LobbyStreamRegister {

  register() {
    this.register_chat_stream()
    this.register_decline_stream()
  }

  register_chat_stream() {
    Streamy.on('lobby_message', this.update_chat_window)
  }

  register_decline_stream() {
    Streamy.on('decline', this.update_decline_message)
  }

  update_chat_window(data) {
    let chat_window = $('#lobby-chat')
    chat_window.append(`<strong>${data.username}:</strong> ${data.message}\n`)
    chat_window.scrollTop(chat_window[0].scrollHeight)
  }

  update_decline_message(data) {
    let decliner = data.decliner.id == Meteor.userId() ? 'You have' : `<strong>${data.decliner.username}</strong> has`
    $('#proposal-message').html(`${decliner} declined the game.`)
  }
}
