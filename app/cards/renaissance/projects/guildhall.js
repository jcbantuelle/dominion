Guildhall = class Guildhall extends Project {

  coin_cost() {
    return 5
  }

  gain_event(gainer, guildhall) {
    let coffer_gainer = new CofferGainer(gainer.game, gainer.player_cards, guildhall)
    coffer_gainer.gain(1)
  }

}
