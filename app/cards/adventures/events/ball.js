Ball = class Ball extends Event {

  coin_cost() {
    return 5
  }

  buy(game, player_cards) {
    if (game.turn.possessed) {
      possessing_player_cards = PlayerCardsModel.findOne(game._id, game.turn.possessed._id)
      if (!possessing_player_cards.tokens.minus_coin) {
        game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> takes their -$1 token`)
        possessing_player_cards.tokens.minus_coin = true
        PlayerCardsModel.update(game._id, possessing_player_cards)
      } else {
        game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> already has their -$1 token`)
      }
    } else {
      if (!player_cards.tokens.minus_coin) {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> takes their -$1 token`)
        player_cards.tokens.minus_coin = true
      } else {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> already has their -$1 token`)
      }
    }

    _.times(2, function() {
      let eligible_cards = _.filter(game.cards, function(card) {
        return card.count > 0 && card.top_card.purchasable && CardCostComparer.coin_less_than(game, card.top_card, 5)
      })

      if (_.size(eligible_cards) > 0) {
        GameModel.update(game._id, game)
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
        turn_event_processor.process(Ball.gain_card)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
      }
    })
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain_game_card()
  }
}
