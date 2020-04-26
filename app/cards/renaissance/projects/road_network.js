RoadNetwork = class RoadNetwork extends Project {

  coin_cost() {
    return 5
  }

  gain_event(gainer, road_network, player_cards) {
    let card_drawer = new CardDrawer(gainer.game, player_cards, road_network)
    card_drawer.draw(1)
  }

}
