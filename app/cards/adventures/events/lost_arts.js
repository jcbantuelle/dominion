LostArts = class LostArts extends Event {

  coin_cost() {
    return 6
  }

  buy(game, player_cards) {
    let eligible_piles = _.filter(game.cards, (card) => {
      return card.supply && _.includes(_.words(card.top_card.types), 'action')
    })

    if (_.size(eligible_piles) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: 'Choose a pile to place your Action token on:',
        cards: eligible_piles,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(LostArts.place_token)
    } else if (_.size(eligible_piles) === 1) {
      LostArts.place_token(game, player_cards, eligible_piles)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no eligible piles`)
    }
  }

  static place_token(game, player_cards, response) {
    let token_placer = new TokenPlacer(game, player_cards, 'action', response[0])
    token_placer.place()
  }
}
