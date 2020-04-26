Wharf = class Wharf extends Duration {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)

    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    player_cards.duration_effects.push(_.clone(card_player.card))
    return 'duration'
  }

  duration(game, player_cards, wharf) {
    let card_drawer = new CardDrawer(game, player_cards, wharf)
    let drawn_count = card_drawer.draw(2)

    let buy_gainer = new BuyGainer(game, player_cards, wharf)
    buy_gainer.gain(1)
  }

}
