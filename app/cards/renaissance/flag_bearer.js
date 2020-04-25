FlagBearer = class FlagBearer extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2)
  }

  gain_event(gainer, flag_bearer) {
    this.take_flag(gainer.game, gainer.player_cards)
  }

  trash_event(trasher, flag_bearer) {
    this.take_flag(trasher.game, trasher.player_cards)
  }

  take_flag(game, player_cards) {
    let card_mover = new CardMover(game, player_cards)
    card_mover.take_unique_card('artifacts', 'Flag')
  }

}
