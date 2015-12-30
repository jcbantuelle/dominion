SwampHag = class SwampHag extends Card {

  types() {
    return ['action', 'duration', 'attack']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    player_cards.duration_effects.push(this.to_h())

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)

    return 'duration'
  }

  attack(game, player_cards) {
    let attack_card = this.to_h()
    attack_card.player_source = game.turn.player
    player_cards.duration_attacks.push(attack_card)
  }

  duration(game, player_cards, duration_card) {
    let gained_coins = CoinGainer.gain(game, player_cards, 3)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins} from ${CardView.render(this)}`)
  }

  buy_event(buyer) {
    let card_gainer = new CardGainer(buyer.game, buyer.player_cards, 'discard', 'Curse')
    card_gainer.gain_game_card()
  }

}
