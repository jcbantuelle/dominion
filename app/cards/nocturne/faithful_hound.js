FaithfulHound = class FaithfulHound extends Card {

  types() {
    return ['action', 'reaction']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(2)
  }

  discard_event(discarder, faithful_hound) {
    let turn_event_id = TurnEventModel.insert({
      game_id: discarder.game._id,
      player_id: discarder.player_cards.player_id,
      username: discarder.player_cards.username,
      type: 'choose_yes_no',
      instructions: `Set aside ${CardView.render(faithful_hound)}?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(discarder.game, discarder.player_cards, turn_event_id, {source: discarder.source, faithful_hound: _.clone(faithful_hound)})
    turn_event_processor.process(FaithfulHound.set_aside)
  }

  static set_aside(game, player_cards, response, params) {
    if (response === 'yes') {
      let card_mover = new CardMover(game, player_cards)
      card_mover.move(player_cards[params.source], player_cards.aside, params.faithful_hound)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside ${CardView.render(params.faithful_hound)}`)
      player_cards.end_turn_event_effects.push(params.faithful_hound)
    }
  }

  end_turn_event(game, player_cards, faithful_hound) {
    let card_mover = new CardMover(game, player_cards)
    card_mover.move(player_cards.aside, player_cards.hand, faithful_hound)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(faithful_hound)} in hand`)
  }

}
