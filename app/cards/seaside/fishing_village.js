FishingVillage = class FishingVillage extends Duration {

  types() {
    return this.capitalism_types(['action', 'duration'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards, card_player) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(2)

    let coin_gainer = new CoinGainer(game, player_cards, card_player)
    coin_gainer.gain(1)

    player_cards.duration_effects.push(_.clone(card_player.card))
    return 'duration'
  }

  duration(game, player_cards, fishing_village) {
    let action_gainer = new ActionGainer(game, player_cards, fishing_village)
    action_gainer.gain(1)

    let coin_gainer = new CoinGainer(game, player_cards, undefined, fishing_village)
    coin_gainer.gain(1)
  }

}
