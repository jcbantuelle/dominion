Ghost = class Ghost extends Card {

  is_purchasable() {
    false
  }

  types() {
    return ['night', 'duration', 'spirit']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    this.reveal(game, player_cards)

    let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
    card_discarder.discard()

    if (player_cards.revealed_card) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside ${CardView.render(player_cards.revealed_card)}`)
      delete player_cards.revealed_card
      return 'duration'
    }
  }

  reveal(game, player_cards) {
    let revealed_cards = []
    while((_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) && !player_cards.revealed_card) {
      if (_.size(player_cards.deck) === 0) {
        DeckShuffler.shuffle(game, player_cards)
      }
      let card = player_cards.deck.shift()
      revealed_cards.push(card)
      if (_.includes(_.words(card.types), 'action')) {
        player_cards.ghost.push(card)
        player_cards.duration_effects.push(this.to_h())
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

  duration(game, player_cards, duration_card) {
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> resolves ${CardView.render(duration_card)}`)
    let set_aside_card = player_cards.ghost.pop()
    player_cards.hand.push(set_aside_card)
    let repeat_card_player = new RepeatCardPlayer(game, player_cards, set_aside_card.id)
    repeat_card_player.play(2, 'Ghost')
  }

}
