Rocks = class Rocks extends Card {

  types() {
    return ['treasure']
  }

  pile_types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  stack_name() {
    return 'Catapult/Rocks'
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(1, false)
  }

  gain_event(gainer) {
    this.gain_silver(gainer)
  }

  trash_event(trasher) {
    this.gain_silver(trasher)
  }

  gain_silver(event_handler) {
    let destination = _.includes(['treasure', 'buy'], event_handler.game.turn.phase) ? 'deck' : 'hand'
    let card_gainer = new CardGainer(event_handler.game, event_handler.player_cards, destination, 'Silver')
    card_gainer.gain()
  }

}
