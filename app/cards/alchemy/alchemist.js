Alchemist = class Alchemist extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  potion_cost() {
    return 1
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)

    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)
  }

  discard_event(discarder) {
    let turn_event_id = TurnEventModel.insert({
      game_id: discarder.game._id,
      player_id: discarder.player_cards.player_id,
      username: discarder.player_cards.username,
      type: 'choose_yes_no',
      instructions: `Put ${CardView.render(this)} On Top of Deck?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(discarder.game, discarder.player_cards, turn_event_id)
    turn_event_processor.process(Alchemist.put_on_deck)
  }

  static put_on_deck(game, player_cards, response) {
    if (response === 'yes') {
      let alchemist = player_cards.discarding.pop()
      game.log.push(`<strong>${player_cards.username}</strong> puts ${CardView.render(alchemist)} on top of their deck`)
      delete alchemist.scheme
      delete alchemist.prince
      if (alchemist.misfit) {
        alchemist = ClassCreator.create('Band Of Misfits').to_h()
      }
      player_cards.deck.unshift(alchemist)
    }
  }

}
