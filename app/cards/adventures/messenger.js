Messenger = class Messenger extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    game.turn.buys += 1
    let gained_coins = CoinGainer.gain(game, player_cards, 2)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy and +$${gained_coins}`)

    if (_.size(player_cards.deck) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: 'Put Deck In Discard?',
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Messenger.discard_deck)
    } else {
      game.log.push(`&nbsp;&nbsp;but the deck is empty`)
    }

  }

  static discard_deck(game, player_cards, response) {
    if (response === 'yes') {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts their deck into their discard pile`)
      player_cards.discard = player_cards.discard.concat(player_cards.deck)
      player_cards.deck = []
    }
  }

  buy_event(buyer) {
    let all_player_cards = PlayerCardsModel.find(buyer.game._id)

    let eligible_cards = _.filter(buyer.game.cards, function(card) {
      let coin_cost = CostCalculator.calculate(buyer.game, card.top_card, all_player_cards)
      return card.count > 0 && card.top_card.purchasable && coin_cost <= 4 && card.top_card.potion_cost === 0
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: buyer.game._id,
        player_id: buyer.player_cards.player_id,
        username: buyer.player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: 'Choose a card to gain:',
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(buyer.game, buyer.player_cards, turn_event_id)
      turn_event_processor.process(Messenger.gain_card)
    } else {
      buyer.game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain_game_card()

    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game)
    ordered_player_cards.shift()
    _.each(ordered_player_cards, function(other_player_cards) {
      let other_player_card_gainer = new CardGainer(game, other_player_cards, 'discard', selected_cards[0].name)
      other_player_card_gainer.gain_game_card()
      PlayerCardsModel.update(game._id, other_player_cards)
    })
  }

}
