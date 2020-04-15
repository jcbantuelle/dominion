SeaHag = class SeaHag extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)
  }

  attack(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      if (_.size(player_cards.deck) === 0) {
        DeckShuffler.shuffle(game, player_cards)
      }
      let card_discarder = new CardDiscarder(game, player_cards, 'deck', player_cards.deck[0])
      card_discarder.discard()
    }

    let card_gainer = new CardGainer(game, player_cards, 'deck', 'Curse')
    card_gainer.gain_game_card()
  }

}
