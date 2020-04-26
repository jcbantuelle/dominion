Academy = class Academy extends Project {

  coin_cost() {
    return 5
  }

  gain_event(gainer, academy) {
    let villager_gainer = new VillagerGainer(gainer.game, gainer.player_cards, academy)
    villager_gainer.gain(1)
  }

}
