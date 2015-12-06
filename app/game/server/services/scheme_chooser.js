SchemeChooser = class SchemeChooser {

  static choose(game, player_cards) {
    let action_cards = _.filter(player_cards.in_play, (card) => {
      return _.contains(_.words(card.types), 'action')
    })
    if (!_.isEmpty(action_cards)) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose up to ${game.turn.schemes} Action cards to put on deck from ${CardView.card_html('action', 'Scheme')}:`,
        cards: action_cards,
        minimum: 0,
        maximum: game.turn.schemes
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(SchemeChooser.mark_for_scheme)
    } else {
      game.log.push(`There are no action cards in play for ${CardView.card_html('action', 'Scheme')}`)
    }
  }

  static mark_for_scheme(game, player_cards, selected_cards) {
    _.each(selected_cards, function(selected_card) {
      let scheme_card_index = _.findIndex(player_cards.in_play, function(card_in_play) {
        return card_in_play.name === selected_card.name && !card_in_play.scheme
      })
      player_cards.in_play[scheme_card_index].scheme = true
    })
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses ${CardView.render(selected_cards)} for ${CardView.card_html('action', 'Scheme')}`)
  }

}
