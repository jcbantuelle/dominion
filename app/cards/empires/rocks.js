Rocks = class Rocks extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 4
  }

  stack_name() {
    return 'Catapult/Rocks'
  }

  play(game, player_cards) {
    let gained_coins = CoinGainer.gain(game, player_cards, 1)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)
  }

  gain_event(gainer) {
    this.gain_silver(gainer)
  }

  trash_event(trasher) {
    this.gain_silver(trasher)
  }

  gain_silver(event_handler) {
    let destination = event_handler.game.turn.phase === 'buy' ? 'deck' : 'hand'
    let card_gainer = new CardGainer(event_handler.game, event_handler.player_cards, destination, 'Silver')
    card_gainer.gain()
  }

}
