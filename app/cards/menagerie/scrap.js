Scrap = class Scrap extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards, card_player) {
    if (_.size(player_cards.hand) > 1) {
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to trash:',
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card_player)
      turn_event_processor.process(Scrap.trash_card)
    } else if (_.size(player_cards.hand) === 1) {
      Scrap.trash_card(game, player_cards, player_cards.hand, card_player)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static trash_card(game, player_cards, selected_cards, card_player) {
    let number_of_options = CostCalculator.calculate(game, selected_cards[0])
    number_of_options = Math.min(6, number_of_options)

    let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards[0])
    card_trasher.trash()

    if (number_of_options === 6) {
      Scrap.process_choices(game, player_cards, ['card', 'action', 'buy', 'coin', 'silver', 'horse'], card_player)
    } else if (number_of_options > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_options',
        instructions: `Choose ${number_of_options}:`,
        minimum: number_of_options,
        maximum: number_of_options,
        options: [
          {text: '+1 card', value: 'card'},
          {text: '+1 action', value: 'action'},
          {text: '+1 buy', value: 'buy'},
          {text: '+$1', value: 'coin'},
          {text: `Gain ${CardView.render(new Silver)}`, value: 'silver'},
          {text: `Gain ${CardView.render(new Horse)}`, value: 'horse'}
        ]
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card_player)
      turn_event_processor.process(Scrap.process_choices)
    }
  }

  static process_choices(game, player_cards, choices, card_player) {
    _.each(choices, (choice) => {
      if (choice === 'card') {
        let card_drawer = new CardDrawer(game, player_cards, card_player)
        card_drawer.draw(1)
      } else if (choice === 'action') {
        let action_gainer = new ActionGainer(game, player_cards)
        action_gainer.gain(1)
      } else if (choice === 'buy') {
        let buy_gainer = new BuyGainer(game, player_cards)
        buy_gainer.gain(1)
      } else if (choice === 'coin') {
        let coin_gainer = new CoinGainer(game, player_cards, card_player)
        coin_gainer.gain(1)
      } else if (choice === 'silver') {
        let card_gainer = new CardGainer(game, player_cards, 'discard', 'Silver')
        card_gainer.gain()
      } else if (choice === 'horse') {
        let card_gainer = new CardGainer(game, player_cards, 'discard', 'Horse')
        card_gainer.gain()
      }
    })
  }

}
