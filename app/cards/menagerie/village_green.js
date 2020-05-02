VillageGreen = class VillageGreen extends Duration {

  types() {
    return ['action', 'duration', 'reaction']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose When to Receive +1 Card & +2 Actions:`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: 'Now', value: 'now'},
        {text: 'Next Turn', value: 'next_turn'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    let response = turn_event_processor.process(VillageGreen.process_response)

    if (response === 'now') {
      let card_drawer = new CardDrawer(game, player_cards, card_player)
      card_drawer.draw(1)

      let action_gainer = new ActionGainer(game, player_cards)
      action_gainer.gain(2)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses to take the effect next turn`)
      player_cards.duration_effects.push(_.clone(card_player.card))
      return 'duration'
    }
  }

  duration(game, player_cards, village_green) {
    let card_drawer = new CardDrawer(game, player_cards, undefined, village_green)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards, village_green)
    action_gainer.gain(2)
  }

  discard_event(discarder, village_green) {
    let turn_event_id = TurnEventModel.insert({
      game_id: discarder.game._id,
      player_id: discarder.player_cards.player_id,
      username: discarder.player_cards.username,
      type: 'choose_yes_no',
      instructions: `Play ${CardView.render(village_green)}?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(discarder.game, discarder.player_cards, turn_event_id)
    let response = turn_event_processor.process(VillageGreen.play_card)

    if (response === 'yes') {
      let card_player = new CardPlayer(discarder.game, discarder.player_cards, village_green)
      card_player.play(true, true, discarder.source)
    }
  }

  static process_response(game, player_cards, response) {
    return response[0]
  }

  static play_card(game, player_cards, response) {
    return response
  }

}
