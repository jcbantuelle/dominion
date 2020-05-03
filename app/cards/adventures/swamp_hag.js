SwampHag = class SwampHag extends Duration {

  types() {
    return this.capitalism_types(['action', 'duration', 'attack'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let player_attacker = new PlayerAttacker(game, this, card_player)
    player_attacker.attack(player_cards)

    player_cards.duration_effects.push(_.clone(card_player.card))
    return 'duration'
  }

  attack(game, player_cards, attacker_player_cards, card_player) {
    let attack_card = _.clone(card_player.card)
    attack_card.player_source = game.turn.player
    player_cards.duration_attacks.push(attack_card)
  }

  duration(game, player_cards, swamp_hag) {
    let coin_gainer = new CoinGainer(game, player_cards, undefined, swamp_hag)
    coin_gainer.gain(3)
  }

  buy_event(buyer) {
    let card_gainer = new CardGainer(buyer.game, buyer.player_cards, 'discard', 'Curse')
    card_gainer.gain()
  }

}
