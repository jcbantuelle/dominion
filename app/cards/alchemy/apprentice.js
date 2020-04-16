Apprentice = class Apprentice extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    if (_.size(player_cards.hand) > 1) {
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
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Apprentice.trash_card)
    } else if (_.size(player_cards.hand) === 1) {
      Apprentice.trash_card(game, player_cards, player_cards.hand)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    let cards_to_draw = CostCalculator.calculate(game, selected_cards[0])
    if (selected_cards[0].potion_cost > 0) {
      cards_to_draw += 2
    }

    let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards[0])
    card_trasher.trash()

    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(cards_to_draw)
  }

}
