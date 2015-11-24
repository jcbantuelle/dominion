Venture = class Venture extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    game.turn.coins += 1

    let revealed_treasure = this.reveal(game, player_cards)

    let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
    card_discarder.discard_all()

    if (revealed_treasure) {
      player_cards.hand.push(revealed_treasure)
      let card_player = new CardPlayer(game, player_cards, revealed_treasure.name)
      card_player.play()
    } else {
      game.log.push(`&nbsp;&nbsp;but does not have any treasures in their deck`)
    }
    delete player_cards.revealed_treasure
  }

  reveal(game, player_cards) {
    let revealed_cards = []
    var revealed_treasure
    while((_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) && !revealed_treasure) {
      if (_.size(player_cards.deck) === 0) {
        DeckShuffler.shuffle(player_cards)
      }
      let card = player_cards.deck.shift()
      revealed_cards.push(card)
      if (_.contains(card.types, 'treasure')) {
        revealed_treasure = card
      } else {
        player_cards.revealed.push(card)
      }
    }
    if (!_.isEmpty(revealed_cards)) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(revealed_cards)}`)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in their deck`)
    }

    return revealed_treasure
  }

}
