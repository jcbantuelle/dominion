CursedVillage = class CursedVillage extends Card {

  types() {
    return ['action', 'doom']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(2)

    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw_until(6)
  }

  gain_event(gainer) {
    let hex_receiver = new EffectReceiver(gainer.game, gainer.player_cards, 'hex')
    hex_receiver.receive()
  }

}
