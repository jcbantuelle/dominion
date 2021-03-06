CountingHouse = class CountingHouse extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let eligible_cards = _.filter(player_cards.discard, (card) => {
      return card.name === 'Copper'
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose any number of coppers to put in hand:',
        cards: eligible_cards,
        minimum: 0,
        maximum: 0
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(CountingHouse.add_coppers)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not put any coppers into their hand`)
    }
  }

  static add_coppers(game, player_cards, selected_cards) {
    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal(player_cards.discard, selected_cards)

    let copper_count = 0
    _.each(selected_cards, (selected_card) => {
      let card_mover = new CardMover(game, player_cards)
      if (card_mover.move(player_cards.discard, player_cards.hand, selected_card)) {
        copper_count += 1
      }
    })

    if (copper_count === 0) {
      game.log.push(`&nbsp;&nbsp;but does not put any coppers into their hand`)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${copper_count} ${CardView.render(new Copper())} in their hand`)
    }
  }

}
