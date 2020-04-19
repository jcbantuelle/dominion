Pillage = class Pillage extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let card_trasher = new CardTrasher(game, player_cards, 'in_play', card_player.card)
    let trashed_card_count = _.size(card_trasher.trash())

    if (trashed_card_count === 1) {
      game.turn.pillage_attack = true

      _.times(2, function() {
        let card_gainer = new CardGainer(game, player_cards, 'discard', 'Spoils')
        card_gainer.gain()
      })
    } else {
      game.log.push(`&nbsp;&nbsp;but nothing happens because it can't be trashed`)
    }

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)

    delete game.turn.pillage_attack
  }

  attack(game, player_cards) {
    if (game.turn.pillage_attack) {
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
  }

  static discard_from_hand(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
    card_discarder.discard()
  }

}
