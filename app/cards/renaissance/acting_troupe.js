ActingTroupe = class ActingTroupe extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards, card_player) {
    let villager_gainer = new VillagerGainer(game, player_cards)
    villager_gainer.gain(4)

    let card_trasher = new CardTrasher(game, player_cards, 'in_play', card_player.card)
    card_trasher.trash()
  }
}
