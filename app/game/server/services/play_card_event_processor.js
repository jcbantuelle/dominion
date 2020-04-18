PlayCardEventProcessor = class PlayCardEventProcessor {

  static in_play_event_cards() {
    return ['Urchin']
  }

  constructor(card_player) {
    this.card_player = card_player
    this.event_id = 3000
    this.find_play_card_events()
  }

  find_play_card_events() {
    this.play_card_events = []

    _.each(this.card_player.player_cards.in_play, (card) => {
      if (_.includes(PlayCardEventProcessor.in_play_event_cards(), card.name)) {
        if (card.name === 'Urchin' && this.card_player.game.turn.player._id === this.card_player.player_cards.player_id) {
          if (_.includes(_.words(this.card_player.card.types), 'attack') && card.id !== this.card_player.card.id) {
            this.play_card_events.push(card)
          }
        }
      }
    })
  }

  process() {
    if (!_.isEmpty(this.play_card_events)) {
      let mandatory_play_card_events = _.filter(this.play_card_events, (event) => {
        return false
      })
      if (_.size(this.play_card_events) === 1 && !_.isEmpty(mandatory_play_card_events)) {
        PlayCardEventProcessor.play_card_event(this.card_player.game, this.card_player.player_cards, this.play_card_events, this)
      } else {
        GameModel.update(this.card_player.game._id, this.card_player.game)
        let instructions = `Choose Play Card Event To Resolve for ${CardView.render(this.card_player.card)}`
        let minimum = 1
        if (_.isEmpty(mandatory_play_card_events)) {
          instructions += ' (or none to skip)'
          minimum = 0
        }
        let turn_event_id = TurnEventModel.insert({
          game_id: this.card_player.game._id,
          player_id: this.card_player.player_cards.player_id,
          username: this.card_player.player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: `${instructions}:`,
          cards: this.play_card_events,
          minimum: minimum,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(this.card_player.game, this.card_player.player_cards, turn_event_id, this)
        turn_event_processor.process(PlayCardEventProcessor.play_card_event)
      }
    }
  }

  static play_card_event(game, player_cards, selected_cards, play_card_event_processor) {
    if (!_.isEmpty(selected_cards)) {
      let card = selected_cards[0]
      let card_object = ClassCreator.create(card.name)
      card_object.play_card_event(play_card_event_processor.card_player, card)

      let play_card_event_index = _.findIndex(play_card_event_processor.play_card_events, (event) => {
        return event.id === card.id
      })
      play_card_event_processor.play_card_events.splice(play_card_event_index, 1)

      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      play_card_event_processor.process()
    }
  }

  generate_event_id() {
    let event_id = _.toString(this.event_id)
    this.event_id += 1
    return event_id
  }

}
