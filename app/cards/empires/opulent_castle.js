OpulentCastle = class OpulentCastle extends Castles {

  types() {
    return this.capitalism_types(['action', 'victory', 'castle'])
  }

  capitalism() {
    return true
  }

  victory_points(player_cards) {
    return 3
  }

  coin_cost() {
    return 7
  }

  play(game, player_cards) {
    let victory_cards = _.filter(player_cards.hand, function(card) {
      return _.includes(_.words(card.types), 'victory')
    })
    if (_.size(victory_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose any number of victory cards to discard:',
        cards: victory_cards,
        minimum: 0,
        maximum: 0
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(OpulentCastle.discard_cards_for_coins)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not discard any victory cards`)
    }
  }

  static discard_cards_for_coins(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;but does not discard any victory cards`)
    } else {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
      card_discarder.discard()

      let coin_gainer = new CoinGainer(game, player_cards)
      coin_gainer.gain(_.size(selected_cards)*2)
    }
  }

}
