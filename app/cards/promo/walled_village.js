WalledVillage = class WalledVillage extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(2)
  }

  discard_event(discarder, walled_village) {
    let turn_event_id = TurnEventModel.insert({
      game_id: discarder.game._id,
      player_id: discarder.player_cards.player_id,
      username: discarder.player_cards.username,
      type: 'choose_yes_no',
      instructions: `Put ${CardView.render(walled_village)} On Top of Deck?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(discarder.game, discarder.player_cards, turn_event_id, walled_village)
    turn_event_processor.process(WalledVillage.put_on_deck)
  }

  static put_on_deck(game, player_cards, response, walled_village) {
    if (response === 'yes') {
      let card_mover = new CardMover(game, player_cards)
      if (card_mover.move(player_cards.in_play, player_cards.deck, walled_village)) {
        game.log.push(`<strong>${player_cards.username}</strong> puts ${CardView.render(walled_village)} on top of their deck`)
      }
    }
  }

}
