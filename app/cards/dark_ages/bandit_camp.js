BanditCamp = class BanditCamp extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(2)

    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Spoils')
    card_gainer.gain()
  }

}
