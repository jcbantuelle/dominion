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
      Meteor.subscribe('player_cards'),
      Meteor.subscribe('turn_event')
    ]
  },

  data: function () {
    let game = Games.findOne(this.params.id, {
      transform: function(game) {
        game.kingdom_cards = []
        game.common_cards = []
        game.log = [game.log.join('<br />')]
        return game
      }
    })

    if (game) {

      let all_player_cards = PlayerCards.find({
        game_id: game._id
      }).fetch()

      game.cards = _.each(game.cards, function(card) {
        card.top_card.coin_cost = CostCalculator.calculate(game, card.top_card, all_player_cards)
        game[`${card.source}_cards`].push(card)
      })

      let player_cards = PlayerCards.findOne({
          game_id: this.params.id,
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
                let card = _.first(grouped_cards)
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
          turn_event_player_id_query = {$in: [Meteor.userId, game.turn.player._id]}
        } else if (Meteor.userId() === game.turn.player._id) {
          turn_event_player_id_query = null
        } else {
          turn_event_player_id_query = Meteor.userId()
        }
      } else {
        turn_event_player_id_query = Meteor.userId()
      }

      let turn_event = TurnEvents.findOne({
        game_id: this.params.id,
        player_id: turn_event_player_id_query
      })

      return {
        game: game,
        player_cards: player_cards,
        turn_event: turn_event,
        pending_players: _.map(TurnEvents.find({game_id: this.params.id}).fetch(), function(turn_event) {
          return `<strong>${turn_event.username}</strong>`
        }).join(' and '),
        public_info: PlayerCards.find({game_id: this.params.id}, {
          transform: function(player_cards) {
            let player_score_calculator = new PlayerScoreCalculator(player_cards)
            let public_info = {
              username: player_cards.username,
              points: player_score_calculator.calculate()
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
            return public_info
          }
        })
      }
    }
  }

})
