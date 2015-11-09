SeaHag = class SeaHag extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
  }

  attack(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      if (_.size(player_cards.deck) === 0) {
        let deck_shuffler = new DeckShuffler(player_cards)
        deck_shuffler.shuffle()
      }
      player_cards.revealed.push(player_cards.deck.shift())
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard_all()
    }

    let card_gainer = new CardGainer(game, player_cards.username, player_cards.deck, 'Curse')
    card_gainer.gain_game_card()
  }

}
