Werewolf = class Werewolf extends Card {

  types() {
    return ['action', 'night', 'attack', 'doom']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    if (game.turn.phase === 'night') {
      if (_.size(game.hexes_deck) === 0) {
        game.hexes_deck = _.shuffle(game.hexes_discard)
        game.hexes_discard = []
      }

      let hex = game.hexes_deck.shift()
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> draws ${CardView.render(hex)} from the Hex Deck`)

      let player_attacker = new PlayerAttacker(game, this)
      player_attacker.attack(player_cards, hex)

      game.hexes_discard.push(hex)
    } else {
      let card_drawer = new CardDrawer(game, player_cards, card_player)
      card_drawer.draw(3)
    }
  }

  attack(game, player_cards, attacker_player_cards, card_player, hex) {
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> receives ${CardView.render(hex)}`)
    GameModel.update(game._id, game)
    ClassCreator.create(hex.name).receive(game, player_cards)
  }

}
