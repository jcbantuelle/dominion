FlagBearer = class FlagBearer extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards, card_player) {
    let coin_gainer = new CoinGainer(game, player_cards, card_player)
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
