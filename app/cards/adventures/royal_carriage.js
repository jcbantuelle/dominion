RoyalCarriage = class RoyalCarriage extends Card {

  types() {
    return ['action', 'reserve']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, player) {
    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    this.move_to_tavern(game, player_cards, player.card.name())
  }

  action_resolution_event(game, player_cards, resolved_action, card_name = 'Royal Carriage') {
    let tavern_card = this
    if (card_name === 'Estate') {
      tavern_card = _.find(player_cards.tavern, function(card) {
        return card.name === 'Estate'
      })
    }
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_yes_no',
      instructions: `Call ${CardView.render(tavern_card)} to replay ${CardView.render(resolved_action)}?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, {resolved_action: resolved_action, card_name: card_name})
    turn_event_processor.process(RoyalCarriage.repeat_action)
  }

  static repeat_action(game, player_cards, response, params) {
    if (response === 'yes') {
      let reserve_index = _.findIndex(player_cards.tavern, function(card) {
        return card.name === params.card_name
      })
      let reserve = player_cards.tavern.splice(reserve_index, 1)[0]
      game.log.push(`<strong>${player_cards.username}</strong> calls ${CardView.render(reserve)}`)

      let action_index = _.findIndex(player_cards.playing, function(card) {
        return card.name === params.resolved_action.name
      })
      let replayed_action = player_cards.playing.splice(action_index, 1)[0]
      player_cards.hand.push(replayed_action)

      let card_player = new CardPlayer(game, player_cards, replayed_action.name, true)
      let replayed_destination = card_player.play()

      let reserve_destination = 'in_play'
      if (_.includes(['duration', 'permanent'], replayed_destination)) {
        reserve_destination = replayed_destination
      }
      player_cards[reserve_destination].push(reserve)
    }
  }

}
