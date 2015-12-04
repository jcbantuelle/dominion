Feodum = class Feodum extends Card {

  types() {
    return ['victory']
  }

  coin_cost() {
    return 4
  }

  victory_points(player_cards) {
    return Math.floor(this.point_variable(player_cards) / 3)
  }

  point_variable(player_cards) {
    return _.size(_.filter(player_cards, function(card) {
      return card.name === 'Silver'
    }))
  }

  trash_event(trasher) {
    _.times(3, function() {
      let card_gainer = new CardGainer(trasher.game, trasher.player_cards, 'discard', 'Silver')
      card_gainer.gain_game_card()
    })
  }

}
