RuinedVillage = class RuinedVillage extends Ruins {

  play(game, player_cards) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)
  }

}
