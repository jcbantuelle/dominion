Butcher = class Butcher extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    if (game.turn.possessed) {
      possessing_player_cards = PlayerCardsModel.findOne(game._id, game.turn.possessed._id)
      possessing_player_cards.coin_tokens += 2
      game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> takes 2 coin tokens`)
      PlayerCardsModel.update(game._id, possessing_player_cards)
    } else {
      player_cards.coin_tokens += 2
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> takes 2 coin tokens`)
    }

    if (_.size(player_cards.hand) > 0) {
      GameModel.update(game._id, game)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to trash (Or none to skip):',
        cards: player_cards.hand,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Butcher.trash_card)

      if (game.turn.butcher_card) {
        GameModel.update(game._id, game)
        PlayerCardsModel.update(game._id, player_cards)
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'overpay',
          instructions: 'Choose any number of coin tokens to pay:',
          minimum: 0,
          maximum: player_cards.coin_tokens
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Butcher.pay_tokens)

        delete game.turn.butcher_card
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let selected_card = selected_cards[0]

      let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_card)
      card_trasher.trash()

      game.turn.butcher_card = selected_card
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> does not trash anything`)
    }
  }

  static pay_tokens(game, player_cards, amount) {
    amount = Number(amount)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> pays ${amount} coin tokens`)
    player_cards.coin_tokens -= amount

    let eligible_cards = _.filter(game.cards, function(card) {
      return card.count > 0 && card.top_card.purchasable && CardCostComparer.card_less_than(game, game.turn.butcher_card, card.top_card, amount + 1)
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
      turn_event_processor.process(Butcher.gain_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain_game_card()
  }

}
