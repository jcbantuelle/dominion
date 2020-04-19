DameAnna = class DameAnna extends Knights {

  types() {
    return ['action', 'attack', 'knight']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    if (_.size(player_cards.hand) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose up to 2 cards to trash: (or none to skip)',
        cards: player_cards.hand,
        minimum: 0,
        maximum: 2
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(DameAnna.trash_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }

    let player_attacker = new PlayerAttacker(game, this, card_player)
    player_attacker.attack(player_cards)
  }

  static trash_cards(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;but does not trash anything`)
    } else {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
      card_trasher.trash()

      PlayerCardsModel.update(game._id, player_cards)
    }
  }

}
