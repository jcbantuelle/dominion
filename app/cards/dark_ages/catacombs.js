Catacombs = class Catacombs extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;but has no cards in deck`)
    } else {
      player_cards.revealed = _.take(player_cards.deck, 3)
      player_cards.deck = _.drop(player_cards.deck, 3)

      let revealed_card_count = _.size(player_cards.revealed)
      if (revealed_card_count < 3 && _.size(player_cards.discard) > 0) {
        DeckShuffler.shuffle(game, player_cards)
        player_cards.revealed = player_cards.revealed.concat(_.take(player_cards.deck, 3 - revealed_card_count))
        player_cards.deck = _.drop(player_cards.deck, 3 - revealed_card_count)
      }

      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> looks at the top ${_.size(player_cards.revealed)} cards of their deck`)

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_options',
        instructions: `${CardView.render(player_cards.revealed)}`,
        minimum: 1,
        maximum: 1,
        options: [
          {text: 'Put cards in hand', value: 'keep'},
          {text: 'Discard and draw 3 cards', value: 'discard'}
        ]
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Catacombs.process_response)
    }
  }

  static process_response(game, player_cards, response) {
    response = response[0]
    if (response === 'keep') {
      player_cards.hand = player_cards.hand.concat(player_cards.revealed)
      player_cards.revealed = []
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts the cards in their hand`)
    } else if (response === 'discard') {
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard()

      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(3)
    }
  }

  trash_event(trasher, card_name = 'Catacombs') {
    let all_player_cards = PlayerCardsModel.find(trasher.game._id)

    let trashed_card = this
    if (card_name === 'Estate') {
      trashed_card = ClassCreator.create('Estate')
    }

    let coin_value = CostCalculator.calculate(trasher.game, trashed_card, all_player_cards)
    let eligible_cards = _.filter(trasher.game.cards, function(card) {
      let coin_cost = CostCalculator.calculate(trasher.game, card.top_card, all_player_cards)
      return card.count > 0 && card.top_card.purchasable && coin_cost < coin_value && card.top_card.potion_cost === 0
    })
    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: trasher.game._id,
        player_id: trasher.player_cards.player_id,
        username: trasher.player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: `Choose a card to gain:`,
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(trasher.game, trasher.player_cards, turn_event_id)
      turn_event_processor.process(Catacombs.gain_card)
    } else {
      gainer.game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_card.name)
    card_gainer.gain_game_card()
  }

}
