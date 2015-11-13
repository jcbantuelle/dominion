SeaHag = class SeaHag extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack()
  }

  attack(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      if (_.size(player_cards.deck) === 0) {
        DeckShuffler.shuffle(player_cards)
      }
      player_cards.revealed.push(player_cards.deck.shift())
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> discards ${CardView.render(player_cards.revealed)} from the top of their deck`)
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard_all(false)
    }

    let card_gainer = new CardGainer(game, player_cards, 'deck', 'Curse')
    card_gainer.gain_game_card()
  }

}
