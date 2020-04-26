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
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(3, false)

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
    if (response[0] === 'keep') {
      let card_mover = new CardMover(game, player_cards)
      card_mover.move_all(player_cards.revealed, player_cards.hand)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts the cards in their hand`)
    } else if (response[0] === 'discard') {
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard()

      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(3)
    }
  }

  trash_event(trasher, catacombs) {
    let eligible_cards = _.filter(trasher.game.cards, function(card) {
      return card.count > 0 && card.supply && CardCostComparer.card_less_than(trasher.game, catacombs, card.top_card)
    })

    if (_.size(eligible_cards) > 1) {
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
    } else if (_.size(eligible_cards) === 1) {
      Catacombs.gain_card(game, player_cards, eligible_cards)
    } else {
      trasher.game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain()
  }

}
