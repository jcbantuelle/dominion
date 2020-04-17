Forge = class Forge extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 7
  }

  play(game, player_cards) {
    if (_.size(player_cards.hand) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose any number of cards to trash:',
        cards: player_cards.hand,
        minimum: 0,
        maximum: 0
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Forge.trash_cards)
    } else {
      Forge.trash_cards(game, player_cards, [])
    }
  }

  static trash_cards(game, player_cards, selected_cards) {
    let cost = _.reduce(selected_cards, (total_cost, card) => {
      return total_cost + CostCalculator.calculate(game, card)
    }, 0)

    let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
    card_trasher.trash()

    let eligible_cards = _.filter(game.cards, (card) => {
      return card.count > 0 && card.supply && CardCostComparer.coin_equal_to(game, card.top_card, cost)
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
      turn_event_processor.process(Forge.gain_card)
    } else if (_.size(eligible_cards) === 1) {
      Forge.gain_card(game, player_cards, eligible_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain()
  }

}
