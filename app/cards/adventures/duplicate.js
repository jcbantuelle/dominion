Duplicate = class Duplicate extends Reserve {

  types() {
    return ['action', 'reserve']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    Reserve.move_to_tavern(game, player_cards, card_player.card)
  }

  gain_event(gainer, duplicate) {
    GameModel.update(gainer.game._id, gainer.game)
    let turn_event_id = TurnEventModel.insert({
      game_id: gainer.game._id,
      player_id: gainer.player_cards.player_id,
      username: gainer.player_cards.username,
      type: 'choose_yes_no',
      instructions: `Call ${CardView.render(duplicate)} to gain a copy of ${CardView.render(gainer.gained_card)}?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(gainer.game, gainer.player_cards, turn_event_id, {gainer: gainer, duplicate: duplicate})
    turn_event_processor.process(Duplicate.gain_copy)
  }

  static gain_copy(game, player_cards, response, params) {
    if (response === 'yes') {
      Reserve.call_from_tavern(game, player_cards, params.duplicate)
      let card_gainer = new CardGainer(game, player_cards, 'discard', params.gainer.gained_card.name)
      card_gainer.gain()
    }
  }

}
