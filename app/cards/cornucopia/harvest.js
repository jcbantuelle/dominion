Harvest = class Harvest extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;but has no cards in deck`)
    } else {
      player_cards.revealed = _.take(player_cards.deck, 4)
      player_cards.deck = _.drop(player_cards.deck, 4)

      let revealed_card_count = _.size(player_cards.revealed)
      if (revealed_card_count < 4 && _.size(player_cards.discard) > 0) {
        DeckShuffler.shuffle(game, player_cards)
        player_cards.revealed = player_cards.revealed.concat(_.take(player_cards.deck, 4 - revealed_card_count))
        player_cards.deck = _.drop(player_cards.deck, 4 - revealed_card_count)
      }

      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.revealed)}`)

      let unique_cards = _.uniqBy(player_cards.revealed, 'name')

      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard()

      let gained_coins = CoinGainer.gain(game, player_cards, _.size(unique_cards))
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)
    }
  }

}
