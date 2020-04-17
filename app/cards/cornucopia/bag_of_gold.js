BagOfGold = class BagOfGold extends Card {

  types() {
    return ['action', 'prize']
  }

  coin_cost() {
    return 0
  }

  play(game, player_cards) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    let card_gainer = new CardGainer(game, player_cards, 'deck', 'Gold')
    card_gainer.gain()
  }

}
