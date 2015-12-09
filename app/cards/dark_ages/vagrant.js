Vagrant = class Vagrant extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
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

      let types = _.words(revealed_card.types)
      if (_.contains(types, 'curse') || _.contains(types, 'ruins') || _.contains(types, 'shelter') || _.contains(types, 'victory')) {
        player_cards.hand.push(revealed_card)
        game.log.push(`&nbsp;&nbsp;and puts it in their hand`)
      } else {
        player_cards.deck.unshift(revealed_card)
        game.log.push(`&nbsp;&nbsp;and puts it back on top of their deck`)
      }

    }
  }

}
