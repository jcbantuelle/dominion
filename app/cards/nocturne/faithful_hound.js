FaithfulHound = class FaithfulHound extends Card {

  types() {
    return ['action', 'reaction']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)
  }

  discard_event(discarder, card_name = 'FaithfulHound') {
    let discard_card = this
    if (card_name === 'Estate') {
      discard_card = _.find(discarder.player_cards.discarding, function(card) {
        return card.name === 'Estate'
      })
    }
    let turn_event_id = TurnEventModel.insert({
      game_id: discarder.game._id,
      player_id: discarder.player_cards.player_id,
      username: discarder.player_cards.username,
      type: 'choose_yes_no',
      instructions: `Set aside ${CardView.render(this)}?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(discarder.game, discarder.player_cards, turn_event_id)
    turn_event_processor.process(FaithfulHound.set_aside)
  }

  static set_aside(game, player_cards, response) {
    if (response === 'yes') {
      let faithful_hound = player_cards.discarding.pop()
      game.log.push(`<strong>${player_cards.username}</strong> sets aside ${CardView.render(faithful_hound)}`)
      delete faithful_hound.scheme
      delete faithful_hound.prince
      if (faithful_hound.misfit) {
        faithful_hound = faithful_hound.misfit
      }
      player_cards.faithful_hounds.push(faithful_hound)
    }
  }

  end_turn_event(game, player_cards, faithful_hound) {
    player_cards.hand.push(faithful_hound)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(faithful_hound)} in hand`)
  }

}
