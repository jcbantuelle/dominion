SchemeResolver = class SchemeResolver {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
  }

  resolve() {
    _.times(this.game.turn.schemes, () => {
      let action_cards = _.filter(this.player_cards.in_play, (card) => {
        return _.contains(_.words(card.types), 'action')
      })
      if (!_.isEmpty(action_cards)) {
        let turn_event_id = TurnEventModel.insert({
          game_id: this.game._id,
          player_id: this.player_cards.player_id,
          username: this.player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose an Action card to put on deck (Or none to skip):',
          cards: action_cards,
          minimum: 0,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id)
        turn_event_processor.process(SchemeResolver.put_card_on_deck)
      } else {
        game.log.push(`There are no action cards in play for ${CardView.card_html('action', 'Scheme')}`)
      }
      GameModel.update(this.game._id, this.game)
    })
  }

  static put_card_on_deck(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let selected_card = selected_cards[0]
      let returned_card_index = _.findIndex(player_cards.in_play, function(card) {
        return card.name === selected_card.name
      })
      let returned_card = player_cards.in_play.splice(returned_card_index, 1)[0]
      player_cards.deck.unshift(returned_card)
      game.log.push(`<strong>${player_cards.username}</strong> places ${CardView.render(selected_card)} on their deck`)
    } else {
      game.log.push(`<strong>${player_cards.username}</strong> chooses not to place an action on deck from ${CardView.card_html('action', 'Scheme')}`)
    }
  }

}
