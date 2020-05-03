Giant = class Giant extends Card {

  types() {
    return this.capitalism_types(['action', 'attack'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    player_cards.tokens.journey = player_cards.tokens.journey === 'up' ? 'down' : 'up'
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> turns their Journey Token face ${player_cards.tokens.journey}`)

    if (player_cards.tokens.journey === 'up') {
      let coin_gainer = new CoinGainer(game, player_cards, card_player)
      coin_gainer.gain(5)
    } else if (player_cards.tokens.journey === 'down') {
      let coin_gainer = new CoinGainer(game, player_cards, card_player)
      coin_gainer.gain(1)
    }

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards, player_cards.tokens.journey)
  }

  attack(game, player_cards, attacker_player_cards, card_player, attacker_journey_token) {
    if (attacker_journey_token === 'up') {
      if (_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) {
        let card_revealer = new CardRevealer(game, player_cards)
        card_revealer.reveal_from_deck(1)

        if (CardCostComparer.coin_between(game, player_cards.revealed[0], 3, 6)) {
          let card_trasher = new CardTrasher(game, player_cards, 'revealed')
          card_trasher.trash()
        } else {
          let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
          card_discarder.discard()

          let card_gainer = new CardGainer(game, player_cards, 'discard', 'Curse')
          card_gainer.gain()
        }
      } else {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in their deck or discard`)
        let card_gainer = new CardGainer(game, player_cards, 'discard', 'Curse')
        card_gainer.gain()
      }
    }
  }

}
