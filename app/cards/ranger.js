Ranger = class Ranger extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    game.turn.buys += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy`)

    player_cards.tokens.journey = player_cards.tokens.journey === 'up' ? 'down' : 'up'
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> turns their Journey Token face ${player_cards.tokens.journey}`)

    if (player_cards.tokens.journey === 'up') {
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(5)
    }
  }

}
