War = class War extends Hex {

  receive(game, player_cards) {
    this.reveal(game, player_cards)

    if (player_cards.trashed_card) {
      let card_trasher = new CardTrasher(game, player_cards, 'revealed', player_cards.trashed_card)
      card_trasher.trash()
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> does not have any cards costing $3 or $4 in their deck`)
    }
    delete player_cards.trashed_card

    let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
    card_discarder.discard()
  }

  reveal(game, player_cards) {
    while((_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) && !player_cards.trashed_card) {
      if (_.size(player_cards.deck) === 0) {
        DeckShuffler.shuffle(game, player_cards)
      }
      let card = player_cards.deck.shift()
      player_cards.revealed.push(card)
      if (CardCostComparer.coin_between(game, card, 3, 4)) {
        player_cards.trashed_card = card
      }
    }
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.revealed)}`)
  }


}
