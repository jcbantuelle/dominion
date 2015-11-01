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
      potion_cost: this.potion_cost(),
      purchasable: this.is_purchasable()
    }
  }

  other_players_cards(game, current_user) {
    return PlayerCards.find({
      game_id: game._id,
      username: {$ne: current_user}
    })
  }

  shuffle_discard(player_cards) {
    let deck_shuffler = new DeckShuffler(player_cards)
    player_cards = deck_shuffler.shuffle()
    return player_cards
  }

  formatted_cards(cards) {
    return _.map(cards, function(card) {
      return `<span class="${card.types}">${card.name}</span>`
    }).join(' ')
  }
}
