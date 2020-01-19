Tormentor = class Tormentor extends Card {

  types() {
    return ['action', 'attack', 'doom']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let gained_coins = CoinGainer.gain(game, player_cards, 2)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)

    let in_play_card_count = _.size(player_cards.in_play.concat(player_cards.playing).concat(player_cards.duration).concat(player_cards.permanent))
    if (in_play_card_count === 1 && !_.isEmpty(player_cards.playing) && player_cards.playing[0].name === 'Tormentor') {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Imp')
      card_gainer.gain_game_card()
    } else {
      if (_.size(game.hexes_deck) === 0) {
        game.hexes_deck = _.shuffle(game.hexes_discard)
        game.hexes_discard = []
      }

      game.turn.tormentor_hex = game.hexes_deck.shift()
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> draws ${CardView.render(game.turn.tormentor_hex)} from the Hex Deck`)

      let player_attacker = new PlayerAttacker(game, this)
      player_attacker.attack(player_cards)

      game.hexes_discard.push(game.turn.tormentor_hex)
      delete game.turn.tormentor_hex
    }
  }

  attack(game, player_cards) {
    let hex = ClassCreator.create(game.turn.tormentor_hex.name)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> receives ${CardView.render(hex)}`)
    GameModel.update(game._id, game)
    hex.receive(game, player_cards)
  }

}
