Template.lobby.onCreated(registerStreams)
Template.lobby.helpers({
  lobby_players: function () {
    return Meteor.users.find({_id: {$ne: Meteor.userId()}})
  },
  proposal: function () {
    return Proposals.findOne({}, {
      transform: function(proposal) {
        proposal.is_proposer = proposal.proposer.id == Meteor.userId()
        _.each(proposal.players, function(player) {
          if (player._id == Meteor.userId() && player.accepted) {
            proposal.accepted = true
          }
        })
        return proposal
      }
    })
  }
})

Template.lobby.events({
  "submit #chat": sendMessage,
  "submit #lobby": proposeGame,
  "click #decline-proposal": declineProposal,
  "click #accept-proposal": acceptProposal
})

function registerStreams() {
  Streamy.on('lobby_message', updateChatWindow)
  Streamy.on('decline', updateDeclineMessage)
}

function updateChatWindow(data) {
  let chat_window = $('#lobby-chat')
  chat_window.append(`<strong>${data.username}:</strong> ${data.message}\n`)
  chat_window.scrollTop(chat_window[0].scrollHeight)
}

function updateDeclineMessage(data) {
  let decliners = _.map(data.decliners, function(decliner) {
    return decliner._id == Meteor.userId() ? 'You' : decliner.username
  }).join(' and ')
  $('#proposal-message').html(`<strong>${decliners}</strong> declined the game.`)
}

function sendMessage(event) {
  event.preventDefault()
  Streamy.broadcast('lobby_message', {
    username: Meteor.user().username,
    message: event.target.message.value
  })
  event.target.message.value = ''
}

function proposeGame(event) {
  event.preventDefault()

  player_ids = $('.lobby-player:checked').map(function() {
    return $(this).val()
  }).get()

  if (player_ids.count > 3)
    alert('Game can not have more than 4 players.')

  Meteor.call('proposeGame', player_ids)
}

function declineProposal(event) {
  event.preventDefault()
  Meteor.call('declineProposal', $('#proposal_id').val())
}

function acceptProposal(event) {
  event.preventDefault()
  Meteor.call('acceptProposal', $('#proposal_id').val())
}
