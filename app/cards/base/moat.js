Moat = class Moat extends Card {

  types() {
    return ['action', 'reaction']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(2)
  }

  attack_event(game, player_cards, card) {
    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal('hand', card)
    player_cards.moat = true
  }

}
