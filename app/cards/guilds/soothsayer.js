Soothsayer = class Soothsayer extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Gold')
    card_gainer.gain()

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)
  }

  attack(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Curse')
    let gained_card = card_gainer.gain()

    if (gained_card && gained_card.name === 'Curse') {
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(1)
    }
  }

}
