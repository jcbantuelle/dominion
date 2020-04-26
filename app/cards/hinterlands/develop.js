Develop = class Develop extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
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
      turn_event_processor.process(Develop.trash_card)
    } else if (_.size(player_cards.hand) === 1) {
      Develop.trash_card(game, player_cards, player_cards.hand)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards[0])
    card_trasher.trash()

    GameModel.update(game._id, game)
    PlayerCardsModel.update(game._id, player_cards)

    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose which to gain first:`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: 'Gain +$1 Card', value: 'gain_more'},
        {text: 'Gain -$1 Card', value: 'gain_less'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, selected_cards[0])
    turn_event_processor.process(Develop.process_response)
  }

  static process_response(game, player_cards, response, trashed_card) {
    let first_cost = response[0] === 'gain_more' ? 1 : -1
    let second_cost = first_cost * -1

    Develop.choose_card(game, player_cards, first_cost, trashed_card)
    GameModel.update(game._id, game)
    Develop.choose_card(game, player_cards, second_cost, trashed_card)
  }

  static choose_card(game, player_cards, coin_modifier, trashed_card) {
    let eligible_cards = _.filter(game.cards, function(card) {
      return card.count > 0 && card.supply && CardCostComparer.card_equal_to(game, trashed_card, card.top_card, coin_modifier)
    })

    let coin_cost = CostCalculator.calculate(game, trashed_card) + coin_modifier
    let debt_cost = trashed_card.debt_cost > 0 ? `<span class="debt">${game.turn.develop_card.debt_cost}</span>` : ''
    let potion_symbols = _.times(trashed_card.potion_cost, function() {
      return '&oplus;'
    }).join('')

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: `Choose a card costing $${coin_cost}${debt_cost}${potion_symbols} to gain:`,
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Develop.gain_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards costing $${coin_cost}${debt_cost}${potion_symbols}`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain()
  }

}
