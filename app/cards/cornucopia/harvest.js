Harvest = class Harvest extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;but has no cards in deck`)
    } else {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(4)

      let unique_cards = _.uniqBy(player_cards.revealed, 'name')

      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard()

      let coin_gainer = new CoinGainer(game, player_cards)
      coin_gainer.gain(_.size(unique_cards))
    }
  }

}
