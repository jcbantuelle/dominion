Patron = class Patron extends Card {

  types() {
    return ['action', 'reaction']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let villager_gainer = new VillagerGainer(game, player_cards)
    villager_gainer.gain(1)

    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2)
  }

  reveal_event(revealer, patron) {
    let coffer_gainer = new CofferGainer(revealer.game, revealer.player_cards, patron)
    coffer_gainer.gain(1)
  }

}
