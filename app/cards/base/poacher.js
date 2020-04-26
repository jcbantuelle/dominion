Poacher = class Poacher extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(1)

    let number_to_discard = _.size(_.filter(game.cards, (game_card) => {
      return game_card.count === 0 && game_card.supply
    }))

    if (number_to_discard > 0) {
      hand_count = _.size(player_cards.hand)
      if (hand_count <= number_to_discard) {
        let card_discarder = new CardDiscarder(game, player_cards, 'hand')
        card_discarder.discard()
      } else {
        let card_text = number_to_discard === 1 ? 'card' : 'cards'
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: `Choose ${number_to_discard} ${card_text} to discard from hand:`,
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
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
    card_discarder.discard()
  }

}
