Training = class Training extends Event {

  coin_cost() {
    return 6
  }

  buy(game, player_cards) {
    let eligible_piles = _.filter(game.cards, function(card) {
      let has_player_token = _.any(card.tokens, function(token) {
        return token.username === player_cards.username
      })
      return !has_player_token && card.top_card.purchasable && _.contains(_.words(card.top_card.types), 'action')
    })

    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_cards',
      game_cards: true,
      instructions: 'Choose a pile to place your +$1 token on:',
      cards: eligible_piles,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(Training.place_token)
  }

  static place_token(game, player_cards, response) {
    let token_placer = new TokenPlacer(game, player_cards, 'coin', response[0])
    token_placer.place()
  }
}
