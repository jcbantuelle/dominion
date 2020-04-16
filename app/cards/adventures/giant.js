Giant = class Giant extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    player_cards.tokens.journey = player_cards.tokens.journey === 'up' ? 'down' : 'up'
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> turns their Journey Token face ${player_cards.tokens.journey}`)

    if (player_cards.tokens.journey === 'up') {
      let gained_coins = CoinGainer.gain(game, player_cards, 5)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)
    } else if (player_cards.tokens.journey === 'down') {
      let gained_coins = CoinGainer.gain(game, player_cards, 1)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)
    }

    game.turn.token_orientation = player_cards.tokens.journey
    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)

    delete game.turn.token_orientation
  }

  attack(game, player_cards) {
    if (game.turn.token_orientation === 'up') {
      if (_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) {
        if (_.size(player_cards.deck) === 0) {
          DeckShuffler.shuffle(game, player_cards)
        }
        let revealed_card = player_cards.deck.shift()
        player_cards.revealed.push(revealed_card)

        if (CardCostComparer.coin_between(game, revealed_card, 3, 6)) {
          let card_trasher = new CardTrasher(game, player_cards, 'revealed', revealed_card)
          card_trasher.trash()
        } else {
          let card_discarder = new CardDiscarder(game, player_cards, 'revealed', revealed_card)
          card_discarder.discard()

          let card_gainer = new CardGainer(game, player_cards, 'discard', 'Curse')
          card_gainer.gain()
        }
      }
    }
  }

}
