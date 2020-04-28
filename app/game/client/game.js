import { FlowRouter } from 'meteor/ostrio:flow-router-extra'
import Bootstrap from 'bootstrap'

Template.game.onCreated(registerStreams)
Template.game.onRendered(createPopovers)

Template.log.onRendered(scrollGameLog)
Template.sort_cards.onRendered(addSortable)

Template.game.helpers({
  current_game() {
    let game = Games.findOne({}, {
      transform: function(game) {
        game.kingdom_cards = []
        game.common_cards = []
        game.not_supply_cards = []
        game.log = [game.log.join('<br />')]
        if (game.black_market_deck) {
          game.black_market_deck = _.shuffle(game.black_market_deck)
        }
        return game
      }
    })

    if (game) {
      let all_player_cards = PlayerCards.find().fetch()

      game.cards = _.each(game.cards, function(card) {
        card.top_card.coin_cost = CostCalculator.calculate(game, card.top_card, false, all_player_cards)
        game[`${card.source}_cards`].push(card)
      })

      let player_cards = PlayerCards.findOne({
          player_id: (game.turn.possessed && game.turn.possessed._id === Meteor.userId()) ? game.turn.player._id : Meteor.userId()
        }, {
          transform: function(cards) {
            cards.discard = _.size(cards.discard)
            cards.deck = _.size(cards.deck)
            cards.hand = _.chain(cards.hand).sortBy(function(card) {
                return card.name
              }).groupBy(function(card) {
                  return card.name
              }).map(function(grouped_cards, name) {
                let card = _.head(grouped_cards)
                card.count = _.size(grouped_cards)
                return card
              }).value()
            return cards
          }
        }
      )

      var turn_event_player_id_query
      if (game.turn.possessed) {
        if (Meteor.userId() === game.turn.possessed._id) {
          turn_event_player_id_query = {$in: [Meteor.userId(), game.turn.player._id]}
        } else if (Meteor.userId() === game.turn.player._id) {
          turn_event_player_id_query = null
        } else {
          turn_event_player_id_query = Meteor.userId()
        }
      } else {
        turn_event_player_id_query = Meteor.userId()
      }

      let turn_event = TurnEvents.findOne({
        player_id: turn_event_player_id_query
      })
      let pending_players = _.map(TurnEvents.find().fetch(), function(turn_event) {
        return `<strong>${turn_event.username}</strong>`
      }).join(' and ')

      return {
        game: game,
        player_cards: player_cards,
        turn_event: turn_event,
        pending_players: pending_players,
        public_info: PlayerCards.find({}, {
          transform: function(player_cards) {
            let player_score_calculator = new PlayerScoreCalculator(player_cards)
            let public_info = {
              username: player_cards.username,
              color: player_cards.color,
              points: player_score_calculator.calculate()
            }
            if (player_cards.villagers > 0) {
              public_info.villagers = player_cards.villagers
            }
            if (player_cards.coffers > 0) {
              public_info.coffers = player_cards.coffers
            }
            if (player_cards.debt_tokens > 0) {
              public_info.debt_tokens = player_cards.debt_tokens
            }
            if (player_cards.victory_tokens > 0) {
              public_info.victory_tokens = player_cards.victory_tokens
            }
            if (player_cards.pirate_ship_coins > 0) {
              public_info.pirate_ship_coins = player_cards.pirate_ship_coins
            }
            if (player_cards.sinister_plot_tokens > 0) {
              public_info.sinister_plot_tokens = player_cards.sinister_plot_tokens
            }
            if (_.size(player_cards.island) > 0) {
              public_info.island = player_cards.island
            }
            if (_.size(player_cards.tavern) > 0) {
              public_info.tavern = player_cards.tavern
            }
            if (_.size(player_cards.cargo_ship) > 0) {
              public_info.cargo_ship = player_cards.cargo_ship
            }
            if (_.size(player_cards.states) > 0) {
              public_info.states = player_cards.states
            }
            if (_.size(player_cards.artifacts) > 0) {
              public_info.artifacts = player_cards.artifacts
            }
            if (player_cards.tokens.journey) {
              public_info.journey_token = player_cards.tokens.journey
            }
            if (player_cards.tokens.minus_coin) {
              public_info.minus_coin = true
            }
            if (player_cards.tokens.minus_card) {
              public_info.minus_card = true
            }
            if (!_.isEmpty(player_cards.inheritance)) {
              public_info.estate = player_cards.inheritance[0]
            }
            return public_info
          }
        })
      }
    }
  }
})

Template.game.events({
  "submit #chat": sendMessage,
  "click #hand .card-image": playCard,
  "click .card-container .card-image": buyCard,
  "click .event-container .card-image": buyEvent,
  "click .project-container .card-image": buyProject,
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
  Streamy.on('game_destroyed', redirectToLobby)
}

function createPopovers() {
  $('body').popover({
    selector: '.card-container .card-image, .event-container .card-image, .project-container .card-image, .hand-card, .prize-card, .state-card, .native-village-card, .haven-card, .cargo-ship-card, .church-card, .archive-card, .research-card, .crypt-card, .island-card, .tavern-card, .state-card, .artifact-card, .trash-card, .black-market-card, .choose-card, .landmark-container .card-image, .boon-container .card-image, #game-log span.card-image, #instructions .card-image, #action-response .card-image, #action-response span.boon, #action-response span.hex',
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
  Meteor.call('sendGameMessage', event.target.message.value, FlowRouter.getParam('id'))
  event.target.message.value = ''
}

function playCard(event) {
  Meteor.call('playCard', $(event.target).attr('data-id'), FlowRouter.getParam('id'))
}

function buyCard(event) {
  Meteor.call('buyCard', $(event.target).attr('data-name'), FlowRouter.getParam('id'))
}

function buyEvent(event) {
  Meteor.call('buyEvent', $(event.target).attr('data-name'), FlowRouter.getParam('id'))
}

function buyProject(event) {
  Meteor.call('buyProject', $(event.target).attr('data-name'), FlowRouter.getParam('id'))
}

function endTurn() {
  Meteor.call('endTurn', FlowRouter.getParam('id'))
}

function playAllCoin() {
  Meteor.call('playAllCoin', FlowRouter.getParam('id'))
}

function playCoinToken() {
  Meteor.call('playCoinToken', FlowRouter.getParam('id'))
}

function playVillager() {
  Meteor.call('playVillager', FlowRouter.getParam('id'))
}

function playDebtToken() {
  Meteor.call('playDebtToken', FlowRouter.getParam('id'))
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

function redirectToLobby(data) {
  if (data.game_id === FlowRouter.getParam(`id`)) {
    FlowRouter.go(`/lobby`)
  }
}
