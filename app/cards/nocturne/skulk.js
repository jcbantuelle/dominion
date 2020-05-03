Skulk = class Skulk extends Card {

  types() {
    return ['action', 'attack', 'doom']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    if (_.size(game.hexes_deck) === 0) {
      game.hexes_deck = _.shuffle(game.hexes_discard)
      game.hexes_discard = []
    }

    let hex = game.hexes_deck.shift()
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> draws ${CardView.render(hex)} from the Hex Deck`)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards, hex)

    game.hexes_discard.push(hex)
  }

  gain_event(gainer) {
    let card_gainer = new CardGainer(gainer.game, gainer.player_cards, 'discard', 'Gold')
    card_gainer.gain()
  }

  attack(game, player_cards, attacker_player_cards, card_player, hex) {
    let hex_object = ClassCreator.create(hex.name)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> receives ${CardView.render(hex)}`)
    GameModel.update(game._id, game)
    hex_object.receive(game, player_cards)
  }

}
