Militia = class Militia extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    game.turn.coins += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$2`)
    Games.update(game._id, game)
  }

  attack(game, player) {
    let player_cards = PlayerCards.findOne({
      player_id: player._id,
      game_id: game._id
    })

    let number_to_discard = _.size(player_cards.hand) - 3

    if (number_to_discard > 0) {
      let turn_event_id = TurnEvents.insert({
        game_id: game._id,
        player_id: player._id,
        username: player.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose ${number_to_discard} cards to discard from hand:`,
        cards: player_cards.hand,
        minimum: number_to_discard,
        maximum: number_to_discard,
        finished: false
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      return turn_event_processor.process(Militia.discard_from_hand)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player.username}</strong> only has ${number_to_discard} cards in hand`)
      Games.update(game._id, game)
    }
  }

  static discard_from_hand(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand')
    card_discarder.discard_some(selected_cards)

    Games.update(game._id, game)
    PlayerCards.update(player_cards._id, player_cards)
  }

}
