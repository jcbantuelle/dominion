Seaway = class Seaway extends Event {

  coin_cost() {
    return 5
  }

  buy(game, player_cards) {
    let eligible_cards = _.filter(game.cards, function(card) {
      let has_player_token = _.some(card.tokens, function(token) {
        return token.name === 'buy' && token.username === player_cards.username
      })
      return !has_player_token && card.count > 0 && card.top_card.purchasable && _.includes(_.words(card.top_card.types), 'action') && CardCostComparer.coin_less_than(game, card.top_card, 5)
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: 'Choose a card to gain:',
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Seaway.gain_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain_game_card()

    let token_placer = new TokenPlacer(game, player_cards, 'buy', selected_cards[0])
    token_placer.place()
  }
}
