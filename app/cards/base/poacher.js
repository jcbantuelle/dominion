Poacher = class Poacher extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    let gained_coins = CoinGainer.gain(game, player_cards, 1)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action and +$${gained_coins}`)

    let number_to_discard = _.size(_.filter(game.cards, function(game_card) {
      return game_card.count === 0 && game_card.top_card.purchasable
    }))

    if (number_to_discard > 0) {
      hand_count = _.size(player_cards.hand)
      if (hand_count <= number_to_discard) {
        let card_discarder = new CardDiscarder(game, player_cards, 'hand')
        card_discarder.discard()
      } else {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: `Choose ${number_to_discard} card(s) to discard from hand:`,
          cards: player_cards.hand,
          minimum: number_to_discard,
          maximum: number_to_discard
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Poacher.discard_from_hand)
      }
    }
  }

  static discard_from_hand(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', _.map(selected_cards, 'name'))
    card_discarder.discard()
  }

}
