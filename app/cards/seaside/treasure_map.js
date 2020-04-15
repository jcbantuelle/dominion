TreasureMap = class TreasureMap extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let card_trasher = new CardTrasher(game, player_cards, 'in_play', card_player.card)
    let trashed_cards = card_trasher.trash()

    let first_trashed = _.find(trashed_cards, (card) => {
      return card.id === card_player.card.id
    })

    let map_in_hand = _.find(player_cards.hand, function(card) {
      return card.name === 'Treasure Map'
    })
    if (map_in_hand) {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', map_in_hand)
      trashed_cards = card_trasher.trash()

      let second_trashed = _.find(trashed_cards, (card) => {
        return card.id === map_in_hand.id
      })

      if (first_trashed && second_trashed) {
        _.times(4, function() {
          let card_gainer = new CardGainer(game, player_cards, 'deck', 'Gold')
          card_gainer.gain_game_card()
        })
      }
    }
  }

}
