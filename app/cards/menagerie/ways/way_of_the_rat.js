WayOfTheRat = class WayOfTheRat extends Way {

  play(game, player_cards, card_player) {
    let eligible_cards = _.filter(player_cards.hand, function(card) {
      return _.includes(_.words(card.types), 'treasure')
    })
    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a treasure to discard: (or none to skip)',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      let selected_cards = turn_event_processor.process(WayOfTheRat.discard_treasure)
      if (_.isEmpty(selected_cards)) {
        game.log.push(`&nbsp;&nbsp;but chooses not to discard a treasure`)  
      } else {
        let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
        card_discarder.discard()

        let card_gainer = new CardGainer(game, player_cards, 'discard', card_player.card.name)
        card_gainer.gain()
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to discard a treasure`)
    }    
  }

  static discard_treasure(game, player_cards, selected_cards) {
    return selected_cards
  }

}
