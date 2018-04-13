Werewolf = class Werewolf extends Card {

  types() {
    return ['action', 'night', 'attack', 'doom']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    if (game.turn.phase === 'night') {
      if (_.size(game.hexes_deck) === 0) {
        game.hexes_deck = _.shuffle(game.hexes_discard)
        game.hexes_discard = []
      }

      game.turn.werewolf_hex = game.hexes_deck.shift()
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> draws ${CardView.render(game.turn.werewolf_hex)} from the Hex Deck`)

      let player_attacker = new PlayerAttacker(game, this)
      player_attacker.attack(player_cards)

      game.hexes_discard.push(game.turn.werewolf_hex)
      delete game.turn.werewolf_hex
    } else {
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(3)
    }
  }

  attack(game, player_cards) {
    let hex = ClassCreator.create(game.turn.werewolf_hex.name)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> receives ${CardView.render(hex)}`)
    GameModel.update(game._id, game)
    hex.receive(game, player_cards)
  }

}
