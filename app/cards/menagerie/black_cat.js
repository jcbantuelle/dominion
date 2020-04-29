BlackCat = class BlackCat extends Card {

  types() {
    return ['action', 'attack', 'reaction']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)

    if (player_cards.player_id !== game.turn.player._id) {
      let player_attacker = new PlayerAttacker(game, this)
      player_attacker.attack(player_cards)
    }
  }

  attack(game, player_cards, card) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Curse')
    card_gainer.gain()
  }

  gain_reaction(game, player_cards, gainer, black_cat) {
    let card_player = new CardPlayer(game, player_cards, black_cat)
    card_player.play(true)
  }

}
