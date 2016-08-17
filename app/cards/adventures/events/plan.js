Plan = class Plan extends Event {

  coin_cost() {
    return 3
  }

  buy(game, player_cards) {
    let eligible_piles = _.filter(game.cards, function(card) {
      let has_player_token = _.some(card.tokens, function(token) {
        return token.name === 'trashing' && token.username === player_cards.username
      })
      return !has_player_token && card.top_card.purchasable && _.includes(_.words(card.top_card.types), 'action')
    })

    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_cards',
      game_cards: true,
      instructions: 'Choose a pile to place your Trashing token on:',
      cards: eligible_piles,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(Plan.place_token)
  }

  static place_token(game, player_cards, response) {
    let token_placer = new TokenPlacer(game, player_cards, 'trashing', response[0])
    token_placer.place()
  }
}
