import { FlowRouter } from 'meteor/ostrio:flow-router-extra'

Template.activeGames.helpers({
  active_games() {
    return {
      games: Games.find({finished: {$exists: false}}, {
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

Template.activeGames.events({
  "click .destroy-game": destroyGame,
  'click a': function(event) {
    event.preventDefault()
    FlowRouter.go(event.target.getAttribute('href'))
  }
})

function destroyGame(event) {
  event.preventDefault()
  Meteor.call('destroyGame', $(event.target).attr('data-game-id'))
}