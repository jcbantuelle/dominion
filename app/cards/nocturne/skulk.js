Skulk = class Skulk extends Card {

  types() {
    return ['action', 'attack', 'doom']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    game.turn.buys += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy`)

    if (_.size(game.hexes_deck) === 0) {
      game.hexes_deck = _.shuffle(game.hexes_discard)
      game.hexes_discard = []
    }

    game.turn.skulk_hex = game.hexes_deck.shift()
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> draws ${CardView.render(game.turn.skulk_hex)} from the Hex Deck`)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)

    game.hexes_discard.push(game.turn.skulk_hex)
    delete game.turn.skulk_hex
  }

  gain_event(gainer) {
    let card_gainer = new CardGainer(gainer.game, gainer.player_cards, 'discard', 'Gold')
    card_gainer.gain_game_card()
  }

  attack(game, player_cards) {
    let hex = ClassCreator.create(game.turn.skulk_hex.name)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> receives ${CardView.render(hex)}`)
    GameModel.update(game._id, game)
    hex.receive(game, player_cards)
  }

}
