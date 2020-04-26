RevealEventProcessor = class RevealEventProcessor {

  static event_cards() {
    return ['Patron']
  }

  constructor(revealer, card) {
    this.revealer = revealer
    this.card = card
    this.find_reveal_events()
  }

  find_reveal_events() {
    this.reveal_events = []

    if (_.includes(RevealEventProcessor.event_cards(), this.card.name)) {
      this.reveal_events.push(this.card)
    }
  }

  process() {
    if (!_.isEmpty(this.reveal_events)) {
      if (_.size(this.reveal_events) === 1) {
        RevealEventProcessor.reveal_event(this.revealer.game, this.revealer.player_cards, this.reveal_events, this)
      } else {
        let turn_event_id = TurnEventModel.insert({
          game_id: this.revealer.game._id,
          player_id: this.revealer.player_cards.player_id,
          username: this.revealer.player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose Reveal Effect to Resolve:',
          cards: this.reveal_events,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(this.revealer.game, this.revealer.player_cards, turn_event_id, this)
        turn_event_processor.process(RevealEventProcessor.reveal_event)
      }
    }
  }

  static reveal_event(game, player_cards, selected_cards, reveal_event_processor) {
    let card = selected_cards[0]
    let card_object = ClassCreator.create(card.name)
    card_object.reveal_event(reveal_event_processor.revealer, card)
    let reveal_event_index = _.findIndex(reveal_event_processor.reveal_events, function(event) {
      return event.id === card.id
    })
    reveal_event_processor.reveal_events.splice(reveal_event_index, 1)

    GameModel.update(game._id, game)
    PlayerCardsModel.update(game._id, player_cards)
    reveal_event_processor.process()
  }
}
