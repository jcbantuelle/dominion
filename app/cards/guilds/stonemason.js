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

    let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
    card_trasher.trash()

    _.times(2, function() {
      let eligible_cards = _.filter(game.cards, function(card) {
        return card.count > 0 && card.supply && CardCostComparer.card_less_than(game, selected_card, card.top_card)
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
      PlayerCardsModel.update(game._id, player_cards)
    })
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain()
  }

  buy_event(buyer) {
    if (buyer.game.turn.coins !== 0 || buyer.game.turn.potions !== 0) {
      if (buyer.game.turn.coins === 0) {
        Stonemason.coin_overpay(buyer.game, buyer.player_cards, '0')
      } else {
        let turn_event_id = TurnEventModel.insert({
          game_id: buyer.game._id,
          player_id: buyer.player_cards.player_id,
          username: buyer.player_cards.username,
          type: 'overpay',
          player_cards: true,
          instructions: 'Choose an amount of coin to overpay by:',
          minimum: 0,
          maximum: buyer.game.turn.coins
        })
        let turn_event_processor = new TurnEventProcessor(buyer.game, buyer.player_cards, turn_event_id)
        turn_event_processor.process(Stonemason.coin_overpay)
      }
    }
  }

  static coin_overpay(game, player_cards, amount) {
    amount = Number(amount)
    if (game.turn.potions === 0) {
      Stonemason.potion_overpay(game, player_cards, '0', amount)
    } else {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'overpay',
        player_cards: true,
        instructions: 'Choose an amount of potion to overpay by:',
        minimum: 0,
        maximum: game.turn.potions
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, amount)
      turn_event_processor.process(Stonemason.potion_overpay)
    }
  }

  static potion_overpay(game, player_cards, amount, coin_overpay) {
    potion_overpay = Number(amount)
    if (coin_overpay === 0 && potion_overpay === 0) {
      game.log.push(`&nbsp;&nbsp;but does not overpay`)
    } else {
      let potion_text = ''
      _.times(potion_overpay, () => {
        potion_text += ' &oplus;'
      })
      game.turn.coins -= coin_overpay
      game.turn.potions -= potion_overpay
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> overpays by $${coin_overpay}${potion_text}`)

      _.times(2, function() {
        let eligible_cards = _.filter(game.cards, function(card) {
          return card.count > 0 && card.supply && _.includes(_.words(card.top_card.types), 'action') && CardCostComparer.cost_equal_to(game, card.top_card, coin_overpay, potion_overpay, 0)
        })

        if (_.size(eligible_cards) > 1) {
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
        } else if (_.size(eligible_cards) === 1) {
          Stonemason.gain_card(game, player_cards, eligible_cards)
        } else {
          game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
        }
        GameModel.update(game._id, game)
        PlayerCardsModel.update(game._id, player_cards)
      })
    }
  }

}
