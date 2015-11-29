Minion = class Minion extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    let turn_event_id = TurnEvents.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose One:`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: '+$2', value: 'coins'},
        {text: 'Discard hand and attack opponents', value: 'discard'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(Minion.process_response)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack()

    delete game.turn.minion_attack
  }

  static process_response(game, player_cards, response) {
    response = response[0]
    if (response === 'coins') {
      game.turn.coins += 2
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$2`)
    } else if (response === 'discard') {
      game.turn.minion_attack = true
      Minion.redraw_hand(game, player_cards)
    }
  }

  attack(game, player_cards) {
    if (game.turn.minion_attack) {
      if (_.size(player_cards.hand) > 4) {
        Minion.redraw_hand(game, player_cards)
      }
    }
  }

  static redraw_hand(game, player_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand')
    card_discarder.discard_all()

    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(4)
  }

}
