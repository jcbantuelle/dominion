Pilgrimage = class Pilgrimage extends Event {

  coin_cost() {
    return 4
  }

  buy(game, player_cards) {
    game.turn.forbidden_events.push(this.name())

    player_cards.tokens.journey = player_cards.tokens.journey === 'up' ? 'down' : 'up'
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> turns their Journey Token face ${player_cards.tokens.journey}`)

    if (player_cards.tokens.journey === 'up') {
      let cards_in_play = player_cards.in_play
      let unique_cards = _.uniqBy(cards_in_play, 'name')
      if (_.size(unique_cards) > 0) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose up to 3 cards to gain:',
          cards: unique_cards,
          minimum: 0,
          maximum: 3
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Pilgrimage.gain_cards)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
      }
    }
  }

  static gain_cards(game, player_cards, selected_cards) {
    _.each(selected_cards, function(selected_card) {
      let card_gainer = new CardGainer(game, player_cards, 'discard', selected_card.name)
      card_gainer.gain()
    })
  }
}
