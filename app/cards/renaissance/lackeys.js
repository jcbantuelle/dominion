Lackeys = class Lackeys extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(2)
  }

  gain_event(gainer, lackeys) {
    let villager_gainer = new VillagerGainer(gainer.game, gainer.player_cards, lackeys)
    villager_gainer.gain(2)
  }

}
