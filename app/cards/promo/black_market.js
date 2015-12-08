BlackMarket = class BlackMarket extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    game.turn.coins += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$2`)

    game.black_market_revealed = _.take(game.black_market_deck, 3)
    game.black_market_deck = _.drop(game.black_market_deck, 3)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(game.black_market_revealed)} from the ${CardView.render(this)} deck`)

    let eligible_treasures = _.filter(player_cards.hand, function(card) {
      return _.contains(_.words(card.types), 'treasure')
    })
    if (_.size(eligible_treasures) > 0) {
      GameModel.update(game._id, game)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose any number of treasures to play:',
        cards: eligible_treasures,
        minimum: 0,
        maximum: 0
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(BlackMarket.choose_treasures)
    }

    let all_player_cards = PlayerCardsModel.find(game._id)

    let eligible_buys = _.filter(game.black_market_revealed, function(card) {
      let coin_cost = CostCalculator.calculate(game, card, all_player_cards)
      return coin_cost <= game.turn.coins && card.potion_cost <= game.turn.potions && !_.contains(game.turn.contraband, card.name) && (card.name !== 'Grand Market' || !_.contains(_.pluck(player_cards.in_play, 'name'), 'Copper'))
    })
    if (_.size(eligible_buys) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        show_images: true,
        instructions: 'Choose a card to buy (Or none to skip):',
        cards: eligible_buys,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(BlackMarket.buy_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no eligible cards to buy`)
    }

    if (!_.isEmpty(game.black_market_revealed)) {
      if (_.size(game.black_market_revealed) > 1) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'sort_cards',
          instructions: `Choose order to put cards on bottom of ${CardView.render(this)} deck: (rightmost will be bottom)`,
          cards: game.black_market_revealed
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(BlackMarket.replace_revealed)
      } else {
        BlackMarket.replace_revealed(game, player_cards, game.black_market_revealed)
      }
    }

    if (game.black_market_bought_card) {
      game.black_market_deck.unshift(game.black_market_bought_card)
      delete game.black_market_bought_card
    }
  }

  static choose_treasures(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let non_bulk_playable_treasures = _.difference(_.pluck(selected_cards, 'name'), AllCoinPlayer.bulk_playable_treasures())
      if (!_.isEmpty(non_bulk_playable_treasures && _.size(selected_cards) > 1)) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'sort_cards',
          instructions: 'Choose order to play treasures: (leftmost will be first)',
          cards: selected_cards
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(BlackMarket.play_treasures)
      } else {
        BlackMarket.play_treasures(game, player_cards, _.pluck(selected_cards, 'name'))
      }
    }
  }

  static play_treasures(game, player_cards, ordered_card_names) {
    _.each(ordered_card_names, function(card_name) {
      let card_player = new CardPlayer(game, player_cards, card_name, true)
      card_player.play()
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
    })
  }

  static buy_card(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      game.black_market_bought_card = selected_cards[0]
      let revealed_index = _.findIndex(game.black_market_revealed, function(card) {
        return card.name === game.black_market_bought_card.name
      })
      game.black_market_revealed.splice(revealed_index, 1)
      let card_buyer = new BlackMarketCardBuyer(game, player_cards)
      card_buyer.buy()
    }
  }

  static replace_revealed(game, player_cards, ordered_card_names) {
     _.each(ordered_card_names, function(card_name) {
      let revealed_card_index = _.findIndex(game.black_market_revealed, function(card) {
        return card.name === card_name
      })
      let revealed_card = game.black_market_revealed.splice(revealed_card_index, 1)[0]
      game.black_market_deck.push(revealed_card)
    })
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places the remaining cards on the bottom of the ${CardView.card_html('action', 'Black Market')} deck`)
  }
}
