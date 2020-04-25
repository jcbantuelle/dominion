Tormentor = class Tormentor extends Card {

  types() {
    return ['action', 'attack', 'doom']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2)

    if (_.size(player_cards.in_play) === 1 && player_cards.in_play[0].id === card_player.card.id) {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Imp')
      card_gainer.gain()
    } else {
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
  }

  attack(game, player_cards, attacker_player_cards, card_player, hex) {
    let hex_object = ClassCreator.create(hex.name)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> receives ${CardView.render(hex)}`)
    GameModel.update(game._id, game)
    hex_object.receive(game, player_cards)
  }

}
