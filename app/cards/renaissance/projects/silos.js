Silos = class Silos extends Project {

  coin_cost() {
    return 4
  }

  start_turn_event(game, player_cards, silos) {
    game.log.push(`<strong>${player_cards.username}</strong> resolves ${CardView.render(silos)}`)

    let eligible_cards = _.filter(player_cards.hand, (card) => {
      return card.name === 'Copper'
    })

    if (_.size(eligible_cards) > 0) {
      GameModel.update(game._id, game)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose any number of ${CardView.render(new Copper())} to discard:`,
        cards: eligible_cards,
        minimum: 0,
        maximum: 0
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Silos.discard_coppers)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not discard any ${CardView.render(new Copper())}`)
    }
  }

  static discard_coppers(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;but does not discard any ${CardView.render(new Copper())}`)
    } else {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal('hand', selected_cards)

      let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
      card_discarder.discard()

      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(_.size(selected_cards))
    }
  }

}
