RoyalCarriage = class RoyalCarriage extends Card {

  types() {
    return ['action', 'reserve']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    this.move_to_tavern(game, player_cards, 'Royal Carriage')
  }

  reserve(game, player_cards, resolved_action) {
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_yes_no',
      instructions: `Call ${CardView.render(this)} to replay ${CardView.render(resolved_action)}?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, resolved_action)
    turn_event_processor.process(RoyalCarriage.repeat_action)
  }

  static repeat_action(game, player_cards, response, resolved_action) {
    if (response === 'yes') {
      let reserve_index = _.findIndex(player_cards.tavern, function(card) {
        return card.name === 'Royal Carriage'
      })
      let reserve = player_cards.tavern.splice(reserve_index, 1)[0]
      game.log.push(`<strong>${player_cards.username}</strong> calls ${CardView.render(reserve)}`)

      let action_index = _.findIndex(player_cards.playing, function(card) {
        return card.name === resolved_action.name
      })
      let replayed_action = player_cards.playing.splice(action_index, 1)[0]
      player_cards.hand.push(replayed_action)

      let card_player = new CardPlayer(game, player_cards, replayed_action.name, true)
      let replayed_destination = card_player.play()

      let reserve_destination = 'in_play'
      if (_.contains(['duration', 'permanent'], replayed_destination)) {
        reserve_destination = replayed_destination
      }
      player_cards[reserve_destination].push(reserve)
    }
  }

}