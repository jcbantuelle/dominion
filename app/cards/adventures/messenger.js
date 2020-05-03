Messenger = class Messenger extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    let coin_gainer = new CoinGainer(game, player_cards, card_player)
    coin_gainer.gain(2)

    if (_.size(player_cards.deck) > 0) {
      GameModel.update(game._id, game)
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
      let card_mover = new CardMover(game, player_cards)
      card_mover.move_all(player_cards.deck, player_cards.discard)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts their deck into their discard pile`)
    }
  }

  buy_event(buyer) {
    let eligible_cards = _.filter(buyer.game.cards, function(card) {
      return card.count > 0 && card.supply && CardCostComparer.coin_less_than(buyer.game, card.top_card, 5)
    })

    if (_.size(eligible_cards) > 1) {
      GameModel.update(buyer.game._id, buyer.game)
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
    } else if (_.size(eligible_cards) === 1) {
      Messenger.gain_card(buyer.game, buyer.player_cards, eligible_cards)
    } else {
      buyer.game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain()

    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, player_cards)
    ordered_player_cards.shift()
    _.each(ordered_player_cards, function(other_player_cards) {
      let other_player_card_gainer = new CardGainer(game, other_player_cards, 'discard', selected_cards[0].name)
      other_player_card_gainer.gain()
      PlayerCardsModel.update(game._id, other_player_cards)
    })
  }

}
