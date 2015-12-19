Magpie = class Magpie extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      if (_.size(player_cards.deck) === 0) {
        DeckShuffler.shuffle(game, player_cards)
      }

      let revealed_card = player_cards.deck.shift()
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(revealed_card)}`)

      let card_types = _.words(revealed_card.types)
      if (_.contains(card_types, 'treasure')) {
        player_cards.hand.push(revealed_card)
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(revealed_card)} in their hand`)
      } else {
        player_cards.deck.unshift(revealed_card)
      }

      if (_.contains(card_types, 'action') || _.contains(card_types, 'victory')) {
        let card_gainer = new CardGainer(game, player_cards, 'discard', 'Magpie')
        card_gainer.gain_game_card()
      }

    }
  }

}
