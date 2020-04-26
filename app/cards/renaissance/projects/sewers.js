Sewers = class Sewers extends Project {

  coin_cost() {
    return 3
  }

  trash_event(trasher, sewers) {
    trasher.game.log.push(`<strong>${trasher.player_cards.username}</strong> resolves ${CardView.render(sewers)}`)
    GameModel.update(trasher.game._id, trasher.game)
    PlayerCardsModel.update(trasher.game._id, trasher.player_cards)
    if (_.size(trasher.player_cards.hand) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: trasher.game._id,
        player_id: trasher.player_cards.player_id,
        username: trasher.player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a Card to trash:',
        cards: trasher.player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(trasher.game, trasher.player_cards, turn_event_id, sewers)
      turn_event_processor.process(Sewers.trash_card)
    } else if (_.size(trasher.player_cards.hand) === 1) {
      Sewers.trash_card(trasher.game, trasher.player_cards, trasher.player_cards.hand, sewers)
    } else {
      game.log.push(`&nbsp;&nbsp;but has no cards in hand`)
    }
  }

  static trash_card(game, player_cards, selected_cards, sewers) {
    if (!_.isEmpty(selected_cards)) {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards, sewers)
      card_trasher.trash()
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to trash anything`)
    }
  }

}
