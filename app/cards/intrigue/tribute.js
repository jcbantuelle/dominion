Tribute = class Tribute extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let next_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, player_cards)[1]

    let card_revealer = new CardRevealer(game, next_player_cards)
    card_revealer.reveal_from_deck(2)

    let revealed_cards = _.uniqBy(next_player_cards.revealed, 'name')
    let card_discarder = new CardDiscarder(game, next_player_cards, 'revealed')
    card_discarder.discard()
    PlayerCardsModel.update(game._id, next_player_cards)

    _.each(revealed_cards, function(card) {
      if (_.includes(_.words(card.types), 'action')) {
        let action_gainer = new ActionGainer(game, player_cards)
        action_gainer.gain(2)
      }
      if (_.includes(_.words(card.types), 'treasure')) {
        let coin_gainer = new CoinGainer(game, player_cards, card_player)
        coin_gainer.gain(2)
      }
      if (_.includes(_.words(card.types), 'victory')) {
        let card_drawer = new CardDrawer(game, player_cards, card_player)
        card_drawer.draw(2)
      }
    })
  }

}
