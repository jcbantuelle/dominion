Exploration = class Exploration extends Project {

  coin_cost() {
    return 4
  }

  end_buy_event(game, player_cards, exploration) {
    let coffer_gainer = new CofferGainer(game, player_cards, exploration)
    coffer_gainer.gain(1)

    let villager_gainer = new VillagerGainer(game, player_cards, exploration)
    villager_gainer.gain(1)
  }

}
