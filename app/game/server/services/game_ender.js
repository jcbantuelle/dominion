GameEnder = class GameEnder {

  constructor(game) {
    this.game = game
    this.players_cards = PlayerCardsModel.find(this.game._id)
  }

  end_game() {
    this.update_game()
    this.update_players()
    this.log_game()
  }

  update_game() {
    this.game.scores = this.calculate_scores()
    this.game.finished = true
    this.game.winners = this.winners()
    GameModel.update(this.game._id, this.game)
  }

  update_players() {
    let player_ids = _.pluck(this.game.players, '_id')
    Meteor.users.update({_id: {$in: player_ids}}, {$unset: {current_game: ''}}, {multi: true})
  }

  log_game() {
    GameHistory.insert(_.merge(this.game, {created_at: new Date()}))
  }

  calculate_scores() {
    return _.chain(this.players_cards).map((player_cards) => {
      let all_cards = AllPlayerCardsQuery.find(player_cards)
      let point_cards = this.point_cards(all_cards)
      let deck_breakdown = this.deck_breakdown(all_cards)
      let player_score = {
        username: player_cards.username,
        point_cards: point_cards,
        points: this.card_score(point_cards) + player_cards.victory_tokens,
        turns: player_cards.turns,
        deck_breakdown: deck_breakdown
      }
      if (player_cards.victory_tokens > 0) {
        player_score.victory_tokens = player_cards.victory_tokens
      }
      return player_score
    }).sortBy(function(score) {
      return -score.points
    }).value()
  }

  point_cards(player_cards) {
    return _.chain(player_cards).map(function(player_card) {
      let card = ClassCreator.create(player_card.name)
      return {
        name: card.name(),
        types: card.type_class(),
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
        types: _.first(cards).types,
        point_variable: _.first(cards).point_variable,
        points: _.first(cards).points * _.size(cards)
      }
    }).value()
  }

  deck_breakdown(player_cards) {
    return _.chain(player_cards).groupBy(function(card) {
      return card.name
    }).map(function(cards, card_name) {
      return {
        name: card_name,
        count: _.size(cards),
        types: _.first(cards).types
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
    let winners = _.filter(this.game.scores, (score) => {
      return score.points === this.top_score()
    })
    if (_.size(winners) > 1) {
      winners = this.tiebreaker(winners)
    }
    return _.pluck(winners, 'username').join(', ')
  }

  tiebreaker(top_scorers) {
    return _.reduce(top_scorers, function(winners, top_scorer) {
      if (_.isEmpty(winners) || top_scorer.turns === winners[0].turns) {
        winners.push(top_scorer)
      } else if (top_scorer.turns < winners[0].turns) {
        winners = [top_scorer]
      }
      return winners
    }, [])
  }
}
