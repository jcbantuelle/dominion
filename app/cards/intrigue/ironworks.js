Ironworks = class Ironworks extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let all_player_cards = PlayerCardsModel.find(game._id)

    let eligible_cards = _.filter(game.cards, function(card) {
      let coin_cost = CostCalculator.calculate(game, card.top_card, all_player_cards)
      return card.count > 0 && card.top_card.purchasable && coin_cost <= 4 && card.top_card.potion_cost === 0
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
    let types = _.words(selected_card.top_card.types)
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_card.name)
    card_gainer.gain_game_card()

    let gains = []
    if (_.contains(types, 'action')) {
      game.turn.actions += 1
      gains.push('+1 action')
    }
    if (_.contains(types, 'treasure')) {
      let gained_coins = CoinGainer.gain(game, player_cards, 1)
      gains.push(`+$${gained_coins}`)
    }
    if (_.contains(types, 'victory')) {
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(1)
    }
    if (!_.isEmpty(gains)) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets ${gains.join(' and ')}`)
    }
  }

}
