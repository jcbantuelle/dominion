GameEnder = class GameEnder {

  constructor(game) {
    this.game = game
    this.players_cards = PlayerCards.find({
      game_id: this.game._id
    }).fetch()
    this.card_sources = ['hand', 'discard', 'deck', 'playing', 'in_play', 'revealed', 'duration', 'haven', 'native_village', 'island']
  }

  end_game() {
    this.update_game()
    this.update_players()
  }

  update_game() {
    this.game.scores = this.calculate_scores()
    this.game.finished = true
    this.game.winners = this.winners()
    Games.update(this.game._id, this.game)
  }

  update_players() {
    let player_ids = _.pluck(this.game.players, '_id')
    Meteor.users.update({_id: {$in: player_ids}}, {$unset: {current_game: ''}}, {multi: true})
  }

  calculate_scores() {
    return _.chain(this.players_cards).map((player_cards) => {
      let all_cards = _.reduce(this.card_sources, function(all_cards, source) {
        return all_cards.concat(player_cards[source])
      }, [])
      let point_cards = this.point_cards(all_cards)
      return {
        username: player_cards.username,
        point_cards: point_cards,
        points: this.card_score(point_cards) + player_cards.victory_tokens
      }
    }).sortBy(function(score) {
      return -score.points
    }).value()
  }

  point_cards(player_cards) {
    return _.chain(player_cards).map(function(player_card) {
      let card = ClassCreator.create(player_card.name)
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
