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
    return _.startCase(this.constructor.name)
  }

  image() {
    return _.snakeCase(this.constructor.name)
  }

  type_class() {
    return this.types().join(' ')
  }

  stack_name() {
    return this.name()
  }

  to_h() {
    return {
      name: this.name(),
      image: this.image(),
      types: this.type_class(),
      coin_cost: this.coin_cost(),
      potion_cost: this.potion_cost(),
      purchasable: this.is_purchasable(),
      stack_name: this.stack_name()
    }
  }

  other_players_cards(game, current_user) {
    return PlayerCards.find({
      game_id: game._id,
      username: {$ne: current_user}
    }).fetch()
  }

  shuffle_discard(player_cards) {
    let deck_shuffler = new DeckShuffler(player_cards)
    deck_shuffler.shuffle()
    return player_cards
  }

}
