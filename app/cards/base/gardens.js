Gardens = class Gardens extends Card {

  types() {
    return ['victory']
  }

  coin_cost() {
    return 4
  }

  victory_points(player_cards_id) {
    let player_cards = PlayerCards.findOne(player_cards_id)
    let cards_in_deck = _.size(player_cards.deck) + _.size(player_cards.discard) + _.size(player_cards.in_play) + _.size(player_cards.hand)
    return Math.floor(cards_in_deck / 10)
  }

}
