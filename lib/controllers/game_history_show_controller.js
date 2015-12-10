GameHistoryShowController = LoggedInController.extend({

  waitOn: function() {
    return [
      Meteor.subscribe('game_history'),
      Meteor.subscribe('players')
    ]
  },

  template: 'game',

  data: function () {
    let game = GameHistory.findOne(this.params.id, {
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
        card.top_card.coin_cost = CostCalculator.calculate(game, card.top_card, all_player_cards)
        game[`${card.source}_cards`].push(card)
      })

      return {
        game: game
      }
    }
  }

})
