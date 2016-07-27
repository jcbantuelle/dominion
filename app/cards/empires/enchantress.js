Enchantress = class Enchantress extends Card {

  types() {
    return ['action', 'duration', 'attack']
  }

  coin_cost() {
    return 3
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
    let card_drawer = new CardDrawer(game, player_cards)
    let drawn_count = card_drawer.draw(2, false)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> draws ${drawn_count} cards from ${CardView.render(duration_card)}`)
  }

}
