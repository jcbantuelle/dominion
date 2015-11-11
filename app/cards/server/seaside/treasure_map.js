TreasureMap = class TreasureMap extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let card_trasher = new CardTrasher(game, player_cards.username, player_cards.playing, 'Treasure Map')
    card_trasher.trash()

    let map_in_hand = _.find(player_cards.hand, function(card) {
      return card.name === 'Treasure Map'
    })

    if (map_in_hand) {
      let card_trasher = new CardTrasher(game, player_cards.username, player_cards.hand, 'Treasure Map')
      card_trasher.trash()

      let original_deck_size = _.size(player_cards.deck)
      let card_gainer = new CardGainer(game, player_cards, 'deck', 'Gold')
      _.times(4, function() {
        card_gainer.gain_game_card()
      })
      if (_.size(player_cards.deck) > original_deck_size) {
        game.log.push(`&nbsp;&nbsp;putting them on top of their deck`)
      }
    }
  }

}
