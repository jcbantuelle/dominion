Embargo = class Embargo extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    game.turn.coins += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$2`)

    let card_trasher = new CardTrasher(game, player_cards, 'playing', 'Embargo')
    card_trasher.trash()

    let eligible_cards = _.filter(game.cards, function(card) {
      return card.top_card.purchasable
    })

    let turn_event_id = TurnEvents.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_cards',
      game_cards: true,
      instructions: 'Choose a card to Embargo:',
      cards: eligible_cards,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(Embargo.place_token)
  }

  static place_token(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    let embargo_card = _.find(game.cards, function(card) {
      return card.name === selected_card.name
    })

    embargo_card.embargos += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts an embargo token on ${CardView.render(selected_card)}`)
  }

}
