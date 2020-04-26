Butcher = class Butcher extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let coffer_gainer = new CofferGainer(game, player_cards)
    coffer_gainer.gain(2)

    if (_.size(player_cards.hand) > 0) {
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to trash (or none to skip):',
        cards: player_cards.hand,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Butcher.trash_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
      card_trasher.trash()

      if (player_cards.coffers > 0) {
        GameModel.update(game._id, game)
        PlayerCardsModel.update(game._id, player_cards)
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'overpay',
          instructions: 'Choose any number of Coffers to remove:',
          minimum: 0,
          maximum: player_cards.coffers
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, selected_cards[0])
        turn_event_processor.process(Butcher.pay_tokens)
      } else {
        Butcher.pay_tokens(game, player_cards, '0')
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but does not trash anything`)
    }
  }

  static pay_tokens(game, player_cards, amount, trashed_card) {
    amount = Number(amount)
    let coffer_text = amount === 1 ? 'Coffer' : 'Coffers'
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> removes ${amount} ${coffer_text}`)
    player_cards.coffers -= amount

    let eligible_cards = _.filter(game.cards, function(card) {
      return card.count > 0 && card.supply && CardCostComparer.card_less_than(game, trashed_card, card.top_card, amount + 1)
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
      turn_event_processor.process(Butcher.gain_card)
    } else if (_.size(eligible_cards) === 1) {
      Butcher.gain_card(game, player_cards, eligible_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain()
  }

}
