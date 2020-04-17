Watchtower = class Watchtower extends Card {

  types() {
    return ['action', 'reaction']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw_until(6)
  }

  gain_reaction(game, player_cards, gainer, watchtower) {
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(watchtower)}`)
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Trash ${CardView.render(gainer.gained_card)} or put it on top of your deck?`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: 'Trash', value: 'trash'},
        {text: 'Top of Deck', value: 'deck'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, gainer)
    turn_event_processor.process(Watchtower.process_response)
  }

  static process_response(game, player_cards, response, gainer) {
    if (response[0] === 'trash') {
      let card_trasher = new CardTrasher(game, player_cards, gainer.destination, gainer.gained_card)
      card_trasher.trash()
    } else if (response[0] === 'deck') {
      let card_mover = new CardMover(game, player_cards)
      if (card_mover.move(player_cards[gainer.destination], player_cards.deck, gainer.gained_card)) {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(gainer.gained_card)} on top of their deck`)
        gainer.destination = 'deck'
      }
    }
  }

}
