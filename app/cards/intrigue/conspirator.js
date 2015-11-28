Conspirator = class Conspirator extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    game.turn.coins += 2
    let log_message = `&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$2`

    if (game.turn.played_actions > 2) {
      game.turn.actions += 1
      log_message += ' and +1 action'

      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(1)
    }
    game.log.push(log_message)
  }

}
