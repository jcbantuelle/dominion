Goons = class Goons extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 6
  }

  play(game, player_cards) {
    game.turn.buys += 1
    game.turn.coins += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy and +$2`)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack()
  }

  attack(game, player_cards) {
    let number_to_discard = _.size(player_cards.hand) - 3

    if (number_to_discard > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose ${number_to_discard} cards to discard from hand:`,
        cards: player_cards.hand,
        minimum: number_to_discard,
        maximum: number_to_discard
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Goons.discard_from_hand)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> only has ${_.size(player_cards.hand)} cards in hand`)
    }
  }

  static discard_from_hand(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand')
    card_discarder.discard_some(selected_cards)
  }

}
