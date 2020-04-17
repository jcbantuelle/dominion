Patrician = class Patrician extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  stack_name() {
    return 'Patrician/Emporium'
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    if (_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) {
      if (_.isEmpty(player_cards.deck)) {
        let deck_shuffler = new DeckShuffler(game, player_cards)
        deck_shuffler.shuffle()
      }

      let top_card = player_cards.deck[0]
      let log_message = `&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(top_card)}`

      if (CardCostComparer.coin_greater_than(game, top_card, 4)) {
        player_cards.hand.push(player_cards.deck.shift())
        log_message += ', putting it in their hand'
      } else {
        log_message += ', putting it back on top of their deck'
      }

      game.log.push(log_message)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in deck to reveal`)
    }
  }

}
