import { FlowRouter } from 'meteor/ostrio:flow-router-extra'

Template.playersShow.helpers({
  player() {
    let player = PlayerRankings.findOne({username: FlowRouter.getParam('id')}, {
      transform: function(player) {
        let total_games = player.wins + player.losses
        player.win_ratio = total_games === 0 ? 0 : ((player.wins / total_games) * 100).toFixed(2)

        player.opponents = _.map(player.opponents, function(opponent) {
          let opponent_games = opponent.wins + opponent.losses
          opponent.win_ratio = total_games === 0 ? 0 : ((opponent.wins / opponent_games) * 100).toFixed(2)
          return opponent
        })
        return player
      }
    })
    if (player) {
      player.games = GameHistory.find({}, {
        transform: function(game) {
          game.created_at = dateFormat(game.created_at, "yyyy-mm-dd hh:MM:ss TT")
          game.card_list = _.reduce(game.cards, function(cards, card) {
            if (card.source === 'kingdom') {
              cards.push(card.top_card)
            }
            return cards
          }, [])
          game.card_list = _.compact(_.concat(game.card_list, game.events, game.landmarks, game.projects, game.ways))
          return game
        }
      }).fetch()
      player.pages = _.ceil(Counts.get('game_history_count') / Pagination.per_page)
      player.page_name = `players/${player.username}`
    }
    return player
  }
})

Template.playersShow.events({
  'click a': function(event) {
    event.preventDefault()
    FlowRouter.go(event.target.getAttribute('href'))
  }
})


