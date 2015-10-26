Card = class Card {

  is_purchasable() {
    return true
  }

  potion_cost() {
    return 0
  }

  victory_points() {
    return 0
  }

  point_variable() {
    return false
  }

  name() {
    return s.humanize(this.constructor.name)
  }

  image() {
    return s.underscored(this.constructor.name)
  }

  type_class() {
    return this.types().join(' ')
  }

  to_h() {
    return {
      name: this.name(),
      image: this.image(),
      types: this.type_class(),
      coin_cost: this.coin_cost(),
      potion_cost: this.potion_cost()
    }
  }

  other_players_cards(game, current_user) {
    return PlayerCards.find({
      game_id: game._id,
      username: {$ne: current_user}
    })
  }
}
