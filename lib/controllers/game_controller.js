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
      Meteor.subscribe('game'),
      Meteor.subscribe('players'),
      Meteor.subscribe('player_cards'),
      Meteor.subscribe('turn_event')
    ]
  },

  data: function () {
    return {
      game: Games.findOne(this.params.id, {
        transform: function(game) {
          game.kingdom_cards = _.sortBy(game.kingdom_cards, function(card) {
            return -(card.top_card.coin_cost + (card.top_card.potion_cost * .1))
          })
          game.log = [game.log.join('<br />')]
          return game
        }
      }),
      player_cards: PlayerCards.findOne({
          game_id: this.params.id,
          player_id: Meteor.userId()
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
      ),
      turn_event: TurnEvents.findOne({
        game_id: this.params.id,
        player_id: Meteor.userId()
      }),
      pending_players: _.map(TurnEvents.find({game_id: this.params.id}).fetch(), function(turn_event) {
        return `<strong>${turn_event.username}</strong>`
      }).join(' and ')
    }
  }

})
