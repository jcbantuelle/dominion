Save = class Save extends Event {

  coin_cost() {
    return 1
  }

  buy(game, player_cards) {
    game.turn.forbidden_events.push(this.name())
    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    if (_.size(player_cards.hand) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to set aside:',
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, this.to_h())
      turn_event_processor.process(Save.set_aside_card)
    } else if (_.size(player_cards.hand) === 1) {
      Save.set_aside_card(game, player_cards, player_cards.hand, this.to_h())
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  end_turn_event(game, player_cards, save) {
    let card_mover = new CardMover(game, player_cards)
    card_mover.move(player_cards.aside, player_cards.hand, save.target)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts their set aside card from ${CardView.render(save)} in hand`)
  }

  static set_aside_card(game, player_cards, selected_cards, save) {
    let card_mover = new CardMover(game, player_cards)
    card_mover.move(player_cards.hand, player_cards.aside, selected_cards[0])
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside a card`)

    save.target = selected_cards[0]
    player_cards.event_effects.push(save)
  }
}
