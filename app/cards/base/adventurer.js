Adventurer = class Adventurer extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 6
  }

  play(game, player_cards) {
    player_cards.revealed_treasures = []
    this.reveal(game, player_cards)

    let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
    card_discarder.discard_all(false)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(player_cards.revealed_treasures)} in hand and discards the rest`)

    delete player_cards.revealed_treasures
  }

  reveal(game, player_cards) {
    revealed_cards = []
    while((_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) && _.size(player_cards.revealed_treasures) < 2) {
      if (_.size(player_cards.deck) === 0) {
        DeckShuffler.shuffle(player_cards)
      }
      let card = player_cards.deck.shift()
      revealed_cards.push(card)
      if (_.contains(card.types, 'treasure')) {
        player_cards.hand.push(card)
        player_cards.revealed_treasures.push(card)
      } else {
        player_cards.revealed.push(card)
      }
    }
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(revealed_cards)}`)
  }

}
