Monastery = class Monastery extends Card {

  types() {
    return ['night']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards, player) {
    let gained_card_count = _.size(game.turn.gained_cards)
    if (gained_card_count > 0) {
      let trashable_cards = _.map(player_cards.hand, function(card) {
        let new_card = _.clone(card)
        new_card.source = 'H'
        return new_card
      })
      _.each(player_cards.in_play, function(card) {
        if (card.name === 'Copper') {
          let copper = _.clone(card)
          copper.source = 'P'
          trashable_cards.push(copper)
        }
      })

      if (_.size(trashable_cards) > 0) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: `Choose up to ${gained_card_count} card(s) to trash:`,
          cards: trashable_cards,
          minimum: 0,
          maximum: gained_card_count
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Monastery.trash_cards)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no cards to trash`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but no cards have been gained`)
    }
  }

  static trash_cards(game, player_cards, selected_cards) {
    _.each(selected_cards, function(card) {
      let source = card.source === 'H' ? 'hand' : 'in_play'
      let card_trasher = new CardTrasher(game, player_cards, source, card)
      card_trasher.trash()
    })
  }

}
