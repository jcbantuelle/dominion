Groom = class Groom extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let eligible_cards = _.filter(game.cards, function(card) {
      return card.count > 0 && card.supply && CardCostComparer.coin_less_than(game, card.top_card, 5)
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
      turn_event_processor.process(Groom.gain_card)
    } else if (_.size(eligible_cards) === 1) {
      Groom.gain_card(game, player_cards, eligible_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    let gained_card = card_gainer.gain()
    let types = _.words(gained_card.types)

    if (_.includes(types, 'action')) {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Horse')
      card_gainer.gain()
    }
    if (_.includes(types, 'treasure')) {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Silver')
      card_gainer.gain()
    }
    if (_.includes(types, 'victory')) {
      let action_gainer = new ActionGainer(game, player_cards)
      action_gainer.gain(1)

      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(1)
    }
  }

}
