Enchantress = class Enchantress extends Duration {

  types() {
    return ['action', 'duration', 'attack']
  }

  coin_cost() {
    return 3
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

  duration(game, player_cards, enchantress) {
    let card_drawer = new CardDrawer(game, player_cards, undefined, enchantress)
    let drawn_count = card_drawer.draw(2)
  }

}
