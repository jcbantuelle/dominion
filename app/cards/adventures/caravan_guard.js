CaravanGuard = class CaravanGuard extends Card {

  types() {
    return ['action', 'duration', 'reaction']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    player_cards.duration_effects.push(this.to_h())

    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    if (player_cards.player_id === game.turn.player._id) {
      game.turn.actions += 1
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)
    }
    return 'duration'
  }

  attack_event(game, player_cards, card_name = 'Caravan Guard') {
    let card_player = new CardPlayer(game, player_cards, card_name, true)
    card_player.play()
  }

  duration(game, player_cards, duration_card) {
    let gained_coins = CoinGainer.gain(game, player_cards, 1)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins} from ${CardView.render(duration_card)}`)
  }

}
