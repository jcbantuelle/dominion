Caravan = class Caravan extends Card {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    player_cards.duration_effects.push(_.clone(card_player.card))
    return 'duration'
  }

  duration(game, player_cards, caravan) {
    let card_drawer = new CardDrawer(game, player_cards, caravan)
    card_drawer.draw(1)
  }

}
