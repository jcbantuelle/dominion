Pillage = class Pillage extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_trasher = new CardTrasher(game, player_cards, 'playing', 'Pillage')
    card_trasher.trash()

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)

    _.times(2, function() {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Spoils')
      card_gainer.gain_game_card()
    })
  }

  attack(game, player_cards) {
    if (_.size(player_cards.hand) >= 5) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.hand)}`)
      GameModel.update(game._id, game)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: game.turn.player._id,
        username: game.turn.player.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose a cards for ${player_cards.username} to discard:`,
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Militia.discard_from_hand)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> only has ${_.size(player_cards.hand)} cards in hand`)
    }
  }

  static discard_from_hand(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', _.map(selected_cards, 'name'))
    card_discarder.discard()
  }

}
