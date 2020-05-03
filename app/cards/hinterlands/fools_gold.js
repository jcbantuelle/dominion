FoolsGold = class FoolsGold extends Card {

  types() {
    return ['treasure', 'reaction']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards, card_player) {
    let coin_to_gain = 4
    if (!game.turn.fools_gold) {
      game.turn.fools_gold = true
      coin_to_gain = 1
    }
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(coin_to_gain)
  }

  gain_reaction(game, player_cards, gainer, fools_gold) {
    let card_trasher = new CardTrasher(game, player_cards, 'hand', fools_gold)
    card_trasher.trash()

    let card_gainer = new CardGainer(game, player_cards, 'deck', 'Gold')
    card_gainer.gain()
  }

}
