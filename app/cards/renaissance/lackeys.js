Lackeys = class Lackeys extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)
  }

  gain_event(gainer) {
    gainer.player_cards.villagers += 2
    gainer.game.log.push(`&nbsp;&nbsp;<strong>${gainer.player_cards.username}</strong> takes 2 villagers`)
  }

}
