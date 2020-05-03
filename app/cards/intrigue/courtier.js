Courtier = class Courtier extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    if (_.size(player_cards.hand) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose a card to reveal:`,
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card_player)
      turn_event_processor.process(Courtier.reveal_card)
    } else if (_.size(player_cards.hand) === 1) {
      Courtier.reveal_card(game, player_cards, player_cards.hand)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in hand`)
    }
  }

  static reveal_card(game, player_cards, selected_cards, card_player) {
    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal('hand', selected_cards)

    GameModel.update(game._id, game)

    card_types_count = _.size(_.words(selected_cards[0].types))

    if (card_types_count < 4) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_options',
        instructions: `Choose ${card_types_count}:`,
        minimum: card_types_count,
        maximum: card_types_count,
        options: [
          {text: '+1 Action', value: 'action'},
          {text: '+1 Buy', value: 'buy'},
          {text: 'Gain a Gold', value: 'gold'},
          {text: '+$3', value: 'coin'}
        ]
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card_player)
      turn_event_processor.process(Courtier.process_choice)
    } else {
      Courtier.process_choice(game, player_cards, ['action', 'buy', 'gold', 'coin'])
    }
  }

  static process_choice(game, player_cards, choices, card_player) {
    _.each(choices, (choice) => {
      if (choice === 'action') {
        let action_gainer = new ActionGainer(game, player_cards)
        action_gainer.gain(1)
      } else if (choice === 'buy') {
        let buy_gainer = new BuyGainer(game, player_cards)
        buy_gainer.gain(1)
      } else if (choice === 'gold') {
        let card_gainer = new CardGainer(game, player_cards, 'discard', 'Gold')
        card_gainer.gain()
      } else if (choice === 'coin') {
        let coin_gainer = new CoinGainer(game, player_cards, card_player)
        coin_gainer.gain(3)
      }
    })
  }

}
