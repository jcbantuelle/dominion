CaravanGuard = class CaravanGuard extends Duration {

  types() {
    return ['action', 'duration', 'reaction']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    if (player_cards.player_id === game.turn.player._id) {
      let action_gainer = new ActionGainer(game, player_cards)
      action_gainer.gain(1)
    }

    player_cards.duration_effects.push(_.clone(card_player.card))
    return 'duration'
  }

  attack_event(game, player_cards, card) {
    let card_player = new CardPlayer(game, player_cards, card)
    card_player.play(true)
  }

  duration(game, player_cards, caravan_guard) {
    let coin_gainer = new CoinGainer(game, player_cards, caravan_guard)
    coin_gainer.gain(1)
  }

}
