Apprentice = class Apprentice extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    if (_.size(player_cards.hand) > 0) {
      let turn_event_id = TurnEvents.insert({
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
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Apprentice.trash_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    let coin_cost = CostCalculator.calculate(game, selected_card)

    if (selected_card.potion_cost > 0) {
      coin_cost += 2
    }

    let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_card.name)
    card_trasher.trash()

    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(coin_cost)
  }

}
