GameController = LoggedInController.extend({

  onBeforeAction: function () {
    let game = Games.findOne(this.params.id)
    if (!game) {
      this.redirect(`/lobby`)
    } else {
      this.next()
    }
  },

  waitOn: function() {
    return [
      Meteor.subscribe('games', this.params.id),
      Meteor.subscribe('players'),
      Meteor.subscribe('player_cards', this.params.id),
      Meteor.subscribe('turn_events', this.params.id)
    ]
  },

  onRun: function () {
    Meteor.call('joinGame', this.params.id)
    this.next()
  },

  onStop: function () {
    Meteor.call('leftGame', this.params.id)
  },

  data: function () {
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
            if (_.size(player_cards.island) > 0) {
              public_info.island = player_cards.island
            }
            if (_.size(player_cards.tavern) > 0) {
              public_info.tavern = player_cards.tavern
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
            if (player_cards.tokens.estate) {
              public_info.estate = player_cards.tokens.estate
            }
            return public_info
          }
        })
      }
    }
  }

})
