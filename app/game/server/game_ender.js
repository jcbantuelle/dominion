GameEnder = class GameEnder {

  constructor(game) {
    this.game = game
    this.players_cards = _.map(this.game.players, (player) => {
      let player_cards = PlayerCards.findOne({
        game_id: this.game._id,
        player_id: player._id
      })
      player_cards.username = player.username
      return player_cards
    })
  }

  end_game() {
    this.update_game()
    this.update_players()
    return this.game
  }

  update_game() {
    this.game.scores = this.calculate_scores()
    this.game.finished = true
    this.game.winners = this.winners()
  }

  update_players() {
    _.each(this.game.players, function(player) {
      Meteor.users.update(player._id, {$unset: {current_game: ''}})
    })
  }

  calculate_scores() {
    return _.chain(this.players_cards).map((player_cards) => {
      let point_cards = this.point_cards(player_cards.hand.concat(player_cards.discard).concat(player_cards.in_play).concat(player_cards.deck))
      return {
        username: player_cards.username,
        point_cards: point_cards,
        points: this.card_score(point_cards)
      }
    }).sortBy(function(score) {
      return score.points
    }).value().reverse()
  }

  point_cards(player_cards) {
    return _.chain(player_cards).map(function(player_card) {
      card = ClassCreator.create(player_card.name)
      return {
        name: card.name(),
        points: card.victory_points(player_cards),
        point_variable: card.point_variable(player_cards)
      }
    }).filter(function(point_card) {
      return point_card.points !== 0
    }).groupBy(function(point_card) {
      return point_card.name
    }).map(function(cards, card_name) {
      return {
        name: card_name,
        count: _.size(cards),
        point_variable: _.first(cards).point_variable,
        points: _.first(cards).points * _.size(cards)
      }
    }).value()
  }

  card_score(point_cards) {
    return _.reduce(point_cards, function(total, point_card) {
      return point_card.points + total
    }, 0)
  }

  top_score() {
    return _.first(this.game.scores).points
  }

  winners() {
    return _.chain(this.game.scores).filter((score) => {
      return score.points === this.top_score()
    }).map(function(score) {
      return score.username
    }).value().join(', ')
  }
}
