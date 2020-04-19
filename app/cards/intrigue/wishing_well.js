WishingWell = class WishingWell extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    if (_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) {
      PlayerCardsModel.update(game._id, player_cards)

      let unique_cards = _.uniqBy(AllPlayerCardsQuery.find(player_cards), 'name')

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Name a card: (or none to skip)',
        cards: unique_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(WishingWell.name_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in deck to reveal`)
    }
  }

  static name_card(game, player_cards, selected_cards) {
    if (!_isEmpty(selected_cards)) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> names ${CardView.render(selected_cards[0])}`)

      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(1)

      if (player_cards.revealed[0].name === selected_cards[0].name) {
        let card_mover = new CardMover(game, player_cards)
        card_mover.move(player_cards.revealed, player_cards.hand, player_cards.revealed[0])
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(selected_cards[0])} in hand`)
      } else {
        let card_returner = new CardReturner(game, player_cards)
        card_returner.return_to_deck(player_cards.revealed)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to name a card`)
    }
  }

}
