Ironworks = class Ironworks extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let eligible_cards = _.filter(game.cards, function(card) {
      return card.count > 0 && card.top_card.purchasable && CardCostComparer.coin_less_than(game, card.top_card, 5)
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
      turn_event_processor.process(Ironworks.gain_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_card.name)
    let gained_card = card_gainer.gain_game_card()
    let types = _.words(gained_card.types)

    let gains = []
    if (_.includes(types, 'action')) {
      game.turn.actions += 1
      gains.push('+1 action')
    }
    if (_.includes(types, 'treasure')) {
      let gained_coins = CoinGainer.gain(game, player_cards, 1)
      gains.push(`+$${gained_coins}`)
    }
    if (_.includes(types, 'victory')) {
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(1)
    }
    if (!_.isEmpty(gains)) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets ${gains.join(' and ')}`)
    }
  }

}
