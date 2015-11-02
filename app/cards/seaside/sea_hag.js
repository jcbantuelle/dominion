SeaHag = class SeaHag extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
  }

  attack(game, player) {
    let player_cards = PlayerCards.findOne({
      player_id: player._id,
      game_id: game._id
    })

    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong>has no cards in deck`)
    } else {
      if (_.size(player_cards.deck) === 0) {
        let deck_shuffler = new DeckShuffler(player_cards)
        deck_shuffler.shuffle()
      }
      player_cards.revealed.push(player_cards.deck.shift())
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard_all(true)
    }

    let card_gainer = new CardGainer(game, player.username, player_cards.deck, 'Curse')
    card_gainer.gain_common_card()

    PlayerCards.update(player_cards._id, player_cards)
    Games.update(game._id, game)
  }

}
