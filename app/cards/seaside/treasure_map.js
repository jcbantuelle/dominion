TreasureMap = class TreasureMap extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, player) {
    let card_trasher = new CardTrasher(game, player_cards, 'playing', player.played_card)
    card_trasher.trash()

    let map_in_hand = _.find(player_cards.hand, function(card) {
      return card.name === 'Treasure Map'
    })

    if (map_in_hand) {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', map_in_hand)
      card_trasher.trash()

      if (player.card.name() === 'Treasure Map') {
        _.times(4, function() {
          let card_gainer = new CardGainer(game, player_cards, 'deck', 'Gold')
          card_gainer.gain_game_card()
        })
      }
    }
  }

}
