import { FlowRouter } from 'meteor/ostrio:flow-router-extra'
import Bootstrap from 'bootstrap'

Template.lobby.onCreated(function() {
  Streamy.on('lobby_message', updateLobbyChatWindow)
  Streamy.on('game_started', function(data) {
    FlowRouter.go(`/game/${data.game_id}`)
  })
})

Template.lobby.events({
  "submit #chat": sendMessage,
  "submit #lobby": proposeGame,
  "click #decline-proposal": declineProposal,
  "click #accept-proposal": acceptProposal
})

Template.lobby.helpers({
  lobby() {
    let proposals = Proposals.find({}, {
      transform: function(proposal) {
        proposal.is_proposer = proposal.proposer.id == Meteor.userId()
        _.each(proposal.players, function(player) {
          if (player._id == Meteor.userId() && player.accepted) {
            proposal.accepted = true
          }
        })
        return proposal
      }
    }).fetch()

    let relevant_proposal = _.find(proposals, function(proposal) {
      return proposal ? _.includes(_.map(proposal.players, '_id'), Meteor.userId()) : false
    })

    return {
      card_sets: _.map(CardList.sets(), function(set) {
        return {
          id: set,
          name: _.startCase(set)
        }
      }),
      lobby_players: Meteor.users.find({
        _id: {$ne: Meteor.userId()},
        'status.online': true,
        lobby: true,
        current_game: {$exists: false}
      }),
      proposal: relevant_proposal,
      player: Meteor.user()
    }
  }
})

function updateLobbyChatWindow(data) {
  let chat_window = $('#lobby-chat')
  chat_window.append(`<strong>${data.username}:</strong> ${data.message}\n`)
  chat_window.scrollTop(chat_window[0].scrollHeight)
}

function isValidKingdom(kingdom_id) {
  return GameHistory.findOne(kingdom_id)
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

  let player_ids = $('.lobby-player:checked').map(function() {
    return $(this).val()
  }).get()

  let exclusions = $('.card-set:checked').map(function() {
    return $(this).val()
  }).get()

  let kingdom_id = _.trim($('.kingdom-id').val())

  let edition = $('.edition:checked').val()

  if (player_ids.length > 3) {
    alert('Game can not have more than 4 players.')
  } else if (player_ids.length < 1) {
    alert('Game must have at least 2 players.')
  } else if (kingdom_id !== '' && !isValidKingdom(kingdom_id)) {
    alert('Game ID is invalid.')
  } else {
    Meteor.call('proposeGame', player_ids, exclusions, kingdom_id, edition)
  }
}

function declineProposal(event) {
  event.preventDefault()
  Meteor.call('declineProposal', $('#proposal_id').val())
}

function acceptProposal(event) {
  event.preventDefault()
  Meteor.call('acceptProposal', $('#proposal_id').val())
}
