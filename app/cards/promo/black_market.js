BlackMarket = class BlackMarket extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards, card_player) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2)

    let black_market_card_buyer = new BlackMarketCardBuyer(game, player_cards)
    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal(game.revealed_black_market, game.revealed_black_market)

    let eligible_treasures = _.filter(player_cards.hand, function(card) {
      return _.includes(_.words(card.types), 'treasure')
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
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card_player.card)
      turn_event_processor.process(BlackMarket.choose_treasures)
    }

    let eligible_buys = black_market_card_buyer.purchasable_cards()
    if (_.size(eligible_buys) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to buy (or none to skip):',
        cards: eligible_buys,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, black_market_card_buyer)
      turn_event_processor.process(BlackMarket.buy_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no eligible cards to buy`)
    }

    GameModel.update(game._id, game)
    PlayerCardsModel.update(game._id, player_cards)
    black_market_card_buyer.return_unpurchased_cards()
  }

  static choose_treasures(game, player_cards, selected_cards, black_market) {
    if (!_.isEmpty(selected_cards)) {
      let non_bulk_playable_treasures = _.difference(_.map(selected_cards, 'name'), AllCoinPlayer.bulk_playable_treasures())
      if (!_.isEmpty(non_bulk_playable_treasures && _.size(selected_cards) > 1)) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'sort_cards',
          instructions: 'Choose order to play treasures: (leftmost will be first)',
          cards: selected_cards
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, black_market)
        turn_event_processor.process(BlackMarket.play_treasures)
      } else {
        BlackMarket.play_treasures(game, player_cards, selected_cards, black_market)
      }
    }
  }

  static play_treasures(game, player_cards, ordered_cards, black_market) {
    _.each(ordered_cards, function(card) {
      let card_player = new CardPlayer(game, player_cards, card, black_market)
      card_player.play(true)
    })
  }

  static buy_card(game, player_cards, selected_cards, black_market_card_buyer) {
    if (!_.isEmpty(selected_cards)) {
      black_market_card_buyer.buy_from_black_market(selected_cards[0])
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to buy anything`)
    }
  }
}
