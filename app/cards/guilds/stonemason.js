Stonemason = class Stonemason extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    if (_.size(player_cards.hand) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to trash:',
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Stonemason.trash_card)
    } else if (_.size(player_cards.hand) === 1) {
      Stonemason.trash_card(game, player_cards, player_cards.hand)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]

    let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_card.name)
    card_trasher.trash()

    let all_player_cards = PlayerCardsModel.find(game._id)

    let trashed_cost = CostCalculator.calculate(game, selected_card, all_player_cards)

    _.times(2, function() {
      let eligible_cards = _.filter(game.cards, function(card) {
        let coin_cost = CostCalculator.calculate(game, card.top_card, all_player_cards)
        return card.count > 0 && card.top_card.purchasable && coin_cost < trashed_cost && card.top_card.potion_cost <= selected_card.potion_cost
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
        turn_event_processor.process(Stonemason.gain_card)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
      }
      GameModel.update(game._id, game)
    })
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain_game_card()
  }

  buy_event(buyer) {
    let turn_event_id = TurnEventModel.insert({
      game_id: buyer.game._id,
      player_id: buyer.player_cards.player_id,
      username: buyer.player_cards.username,
      type: 'overpay',
      player_cards: true,
      instructions: 'Choose an amount to overpay by:',
      minimum: 0,
      maximum: buyer.game.turn.coins
    })
    let turn_event_processor = new TurnEventProcessor(buyer.game, buyer.player_cards, turn_event_id)
    turn_event_processor.process(Stonemason.overpay)
  }

  static overpay(game, player_cards, amount) {
    amount = Number(amount)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> overpays by $${amount}`)
    game.turn.coins -= amount

    let all_player_cards = PlayerCardsModel.find(game._id)
    _.times(2, function() {
      let eligible_cards = _.filter(game.cards, function(card) {
        let coin_cost = CostCalculator.calculate(game, card.top_card, all_player_cards)
        return card.count > 0 && card.top_card.purchasable && coin_cost === amount && card.top_card.potion_cost === 0 && _.includes(_.words(card.top_card.types), 'action')
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
        turn_event_processor.process(Stonemason.gain_card)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
      }
      GameModel.update(game._id, game)
    })
  }

}
