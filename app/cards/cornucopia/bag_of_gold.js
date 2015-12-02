BagOfGold = class BagOfGold extends Card {

  is_purchasable() {
    return false
  }

  types() {
    return ['action', 'prize']
  }

  coin_cost() {
    return 0
  }

  play(game, player_cards) {
    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    let card_gainer = new CardGainer(game, player_cards, 'deck', 'Gold')
    card_gainer.gain_game_card()
  }

}
