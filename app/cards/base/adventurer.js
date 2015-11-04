Adventurer = class Adventurer extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 6
  }

  play(game, player_cards) {
    this.revealed_cards = []
    this.revealed_treasures = []

    player_cards = this.reveal(player_cards)

    if (_.size(this.revealed_treasures) < 2 && _.size(player_cards.discard) > 0) {
      this.shuffle_discard(player_cards)
      player_cards = this.reveal(player_cards)
    }

    let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
    card_discarder.discard_all()

    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${this.formatted_cards(this.revealed_cards)}`)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${this.formatted_cards(this.revealed_treasures)} in hand and discards the rest`)
  }

  reveal(player_cards) {
    while(_.size(player_cards.deck) > 0 && _.size(this.revealed_treasures) < 2) {
      let card = player_cards.deck.shift()
      this.revealed_cards.push(card)
      if (_.contains(card.types, 'treasure')) {
        this.revealed_treasures.push(card)
        player_cards.hand.push(card)
      } else {
        player_cards.revealed.push(card)
      }
    }
    return player_cards
  }

}
