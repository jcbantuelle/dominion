GameHistoryListingController = LoggedInController.extend({

  onRun: function() {
    Session.set('game_history_listing_page', 1)
  },

  waitOn: function () {
    return [
      Meteor.subscribe('players'),
      Meteor.subscribe('game_history', Session.get('game_history_listing_page'))
    ]
  },

  data: function () {
    return {
      games: GameHistory.find({}, {
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
      }),
      pages: _.ceil(Counts.get('game_history_count') / Pagination.per_page),
      page_name: 'game_history_listing_page'
    }
  }

})
