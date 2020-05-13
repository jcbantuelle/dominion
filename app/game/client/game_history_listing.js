import { FlowRouter } from 'meteor/ostrio:flow-router-extra'

Template.gameHistoryListing.helpers({
  games_history() {
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
          game.card_list = _.compact(_.concat(game.card_list, game.events, game.landmarks, game.projects, game.ways))
          return game
        }
      }),
      pages: _.ceil(Counts.get('game_history_count') / Pagination.per_page),
      page_name: 'game_history'
    }
  }
})

Template.gameHistoryListing.events({
  'click a': function(event) {
    event.preventDefault()
    FlowRouter.go(event.target.getAttribute('href'))
  }
})
