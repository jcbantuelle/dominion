FarmingVillage = class FarmingVillage extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    game.turn.actions += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions`)

    this.reveal(game, player_cards)

    if (player_cards.revealed_card) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(player_cards.revealed_card)} in their hand`)
    }

    let card_discarder = new CardDiscarder(game, player_cards, 'revealed', _.map(player_cards.revealed, 'name'))
    card_discarder.discard()

    delete player_cards.revealed_card
  }

  reveal(game, player_cards) {
    let revealed_cards = []
    while((_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) && !player_cards.revealed_card) {
      if (_.size(player_cards.deck) === 0) {
        DeckShuffler.shuffle(game, player_cards)
      }
      let card = player_cards.deck.shift()
      revealed_cards.push(card)
      if (_.includes(_.words(card.types), 'treasure') || _.includes(_.words(card.types), 'action')) {
        player_cards.hand.push(card)
        player_cards.revealed_card = card
      } else {
        player_cards.revealed.push(card)
      }
    }
    if (!_.isEmpty(revealed_cards)) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(revealed_cards)}`)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in their deck`)
    }
  }

}
