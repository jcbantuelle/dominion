DiscardInPlayProcessor = class DiscardInPlayProcessor {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
    this.event_cards = ['Treasury']
  }

  process_cards() {
    let available_event_cards = _.filter(this.player_cards.in_play, (card) => {
      return _.contains(this.event_cards, card.name)
    })

    if (!_.isEmpty(available_event_cards)) {
      let turn_event_id = TurnEvents.insert({
        game_id: this.game._id,
        player_id: this.player_cards.player_id,
        username: this.player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose Card to Resolve:',
        cards: available_event_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id)
      turn_event_processor.process(DiscardInPlayProcessor.resolve_card)
    }
  }

  static resolve_card(game, player_cards, selected_cards) {
    let discarding_card_index = _.findIndex(player_cards.in_play, function(card) {
      return card.name === selected_cards[0].name
    })

    player_cards.discarding = player_cards.in_play.splice(discarding_card_index, 1)
    let event_card = ClassCreator.create(player_cards.discarding[0].name)
    event_card.discard_from_play(game, player_cards)
    player_cards.discard = player_cards.discard.concat(player_cards.discarding)
    player_cards.discarding = []
    let discard_in_play_processor = new DiscardInPlayProcessor(game, player_cards)
    discard_in_play_processor.process_cards()
  }
}
