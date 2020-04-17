Contraband = class Contraband extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(3, false)

    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    let eligible_cards = _.reduce(game.cards, function(cards, card) {
      return cards.concat(_.uniqBy(card.stack, 'name'))
    }, [])
    if (game.black_market_deck) {
      eligible_cards = eligible_cards.concat(game.black_market_deck)
    }

    if (_.size(eligible_cards) > 0) {
      let player_to_left = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, player_cards)[1]

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_to_left.player_id,
        username: player_to_left.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose a card for ${CardView.render(this)}:`,
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_to_left, turn_event_id)
      turn_event_processor.process(Contraband.choose_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to contraband`)
    }
  }

  static choose_card(game, player_cards, selected_cards) {
    game.turn.contraband.push(selected_cards[0].name)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> selects ${CardView.render(selected_cards)} as ${CardView.render(new Contraband())}`)
  }

}
