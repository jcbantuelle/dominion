GameHistoryShowController = LoggedInController.extend({

  waitOn: function() {
    return [
      Meteor.subscribe('game_history'),
      Meteor.subscribe('players')
    ]
  },

  template: 'game',

  data: function () {
    let game_history = GameHistory.findOne(this.params.id, {
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

    if (game_history) {
      _.each(game_history.cards, function(card) {
        game_history[`${card.source}_cards`].push(card)
      })

      return {
        game: game_history
      }
    }
  }

})
