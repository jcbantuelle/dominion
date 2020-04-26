ActiveGamesController = LoggedInAdminController.extend({

  waitOn: function () {
    return [
      Meteor.subscribe('players'),
      Meteor.subscribe('all_games')
    ]
  },

  data: function () {
    return {
      games: Games.find({}, {
        transform: function(game) {
          game.created_at = dateFormat(game.created_at, "yyyy-mm-dd h:MM:ss TT")
          game.card_list = _.reduce(game.cards, function(cards, card) {
            if (card.source === 'kingdom') {
              cards.push(card.top_card)
            }
            return cards
          }, [])
          return game
        }
      })
    }
  }

})

