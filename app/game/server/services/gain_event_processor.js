GainEventProcessor = class GainEventProcessor {

  static reaction_cards() {
    return ['Fools Gold', 'Watchtower']
  }

  static event_cards() {
    return ['Duchy', 'Cache', 'Embassy', 'Ill Gotten Gains', 'Inn', 'Mandarin', 'Border Village', 'Death Cart']
  }

  static in_play_event_cards() {
    return ['Royal Seal']
  }

  constructor(gainer, player_cards) {
    this.gainer = gainer
    this.player_cards = player_cards
    this.find_gain_events()
  }

  find_gain_events() {
    this.gain_events = []

    if (this.gainer.player_cards._id === this.player_cards._id && _.contains(GainEventProcessor.event_cards(), this.gainer.gained_card.name)) {
      if (this.gainer.gained_card.name === 'Duchy') {
        if (this.gainer.game.duchess) {
          this.gain_events.push(this.gainer.gained_card)
        }
      } else {
        this.gain_events.push(this.gainer.gained_card)
      }
    }

    _.each(this.player_cards.hand, (card) => {
      if (_.contains(GainEventProcessor.reaction_cards(), card.name)) {
        if (card.name === 'Fools Gold') {
          if (this.player_cards._id !== this.gainer.player_cards._id && _.last(this.gainer.game.turn.gain_event_stack) === 'Province') {
            this.gain_events.push(card)
          }
        } else if (card.name === 'Watchtower') {
          if (this.player_cards._id === this.gainer.player_cards._id && !_.isEmpty(this.player_cards[this.gainer.destination]) && _.first(this.player_cards[this.gainer.destination]).name === this.gainer.card_name) {
            this.gain_events.push(card)
          }
        }
      }
    })

    _.each(this.player_cards.in_play, (card) => {
      if (_.contains(GainEventProcessor.in_play_event_cards(), card.name)) {
        if (card.name === 'Royal Seal') {
          if (this.player_cards._id === this.gainer.player_cards._id && !_.isEmpty(this.player_cards[this.gainer.destination]) && _.first(this.player_cards[this.gainer.destination]).name === this.gainer.card_name) {
            this.gain_events.push(card)
          }
        } else {
          this.gain_events.push(card)
        }
      }
    })
  }

  process() {
    if (!_.isEmpty(this.gain_events)) {
      let mandatory_gain_events = _.filter(this.gain_events, function(event) {
        return _.contains(GainEventProcessor.event_cards().concat(GainEventProcessor.in_play_event_cards()), event.name)
      })
      if (_.size(this.gain_events) === 1 && !_.isEmpty(mandatory_gain_events)) {
        GainEventProcessor.gain_event(this.gainer.game, this.gainer.player_cards, this.gain_events, this)
      } else {
        GameModel.update(this.gainer.game._id, this.gainer.game)
        let instructions = `Choose Gain Event To Resolve for ${CardView.render(this.gainer.gained_card)}`
        let minimum = 1
        if (_.isEmpty(mandatory_gain_events)) {
          instructions += ' (Or none to skip)'
          minimum = 0
        }
        let turn_event_id = TurnEventModel.insert({
          game_id: this.gainer.game._id,
          player_id: this.player_cards.player_id,
          username: this.player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: `${instructions}:`,
          cards: this.gain_events,
          minimum: minimum,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(this.gainer.game, this.player_cards, turn_event_id, this)
        turn_event_processor.process(GainEventProcessor.gain_event)
      }
    }
  }

  static gain_event(game, player_cards, selected_cards, gain_event_processor) {
    if (!_.isEmpty(selected_cards)) {
      let selected_card = ClassCreator.create(selected_cards[0].name)
      if (_.contains(GainEventProcessor.reaction_cards(), selected_card.name())) {
        selected_card.gain_reaction(game, player_cards, gain_event_processor.gainer)
      } else {
        selected_card.gain_event(gain_event_processor.gainer)
        let gain_event_index = _.findIndex(gain_event_processor.gain_events, function(event) {
          return event.name === selected_cards[0].name
        })
        gain_event_processor.gain_events.splice(gain_event_index, 1)
      }

      if (_.isEmpty(player_cards[gain_event_processor.gainer.destination]) || _.first(player_cards[gain_event_processor.gainer.destination]).name !== gain_event_processor.gainer.card_name) {
        gain_event_processor.gain_events = _.filter(gain_event_processor.gain_events, function(event) {
          return event.name !== 'Watchtower' && event.name !== 'Royal Seal'
        })
      }

      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      gain_event_processor.process()
    }
  }

}
