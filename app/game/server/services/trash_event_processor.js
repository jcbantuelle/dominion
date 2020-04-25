TrashEventProcessor = class TrashEventProcessor {

  static reaction_cards() {
    return ['Market Square']
  }

  static landmark_cards() {
    return ['Tomb']
  }

  static event_cards() {
    return ['Overgrown Estate', 'Squire', 'Feodum', 'Fortress', 'Sir Vander', 'Cultist', 'Hunting Grounds', 'Rats', 'Catacombs', 'Crumbling Castle', 'Rocks', 'Haunted Mirror', 'Silk Merchant', 'Flag Bearer']
  }

  static project_cards() {
    return ['Sewers']
  }

  constructor(trasher, card) {
    this.trasher = trasher
    this.card = card
    this.event_id = 7000
    this.find_trash_events()
  }

  find_trash_events() {
    this.trash_events = []
    if (_.includes(TrashEventProcessor.event_cards(), this.card.name)) {
      this.trash_events.push(this.card)
    }

    _.each(this.trasher.game.landmarks, (landmark) => {
      if (_.includes(TrashEventProcessor.landmark_cards(), landmark.name)) {
        this.trash_events.push(landmark)
      }
    })

    _.each(this.trasher.player_cards.hand, (card) => {
      if (_.includes(TrashEventProcessor.reaction_cards(), card.name)) {
        this.trash_events.push(card)
      }
    })

    _.each(this.trasher.player_cards.projects, (card) => {
      if (_.includes(TrashEventProcessor.project_cards(), card.name)) {
        if (card.name === 'Sewers') {
          if (!this.trasher.trashed_by || this.trasher.trashed_by.name !== 'Sewers') {
            this.trash_events.push(card)
          }
        } else {
          this.trash_events.push(card)
        }
      }
    })

    _.times(this.trasher.game.turn.priests, (count) => {
      if (this.trasher.player_cards.player_id === this.trasher.game.turn.player._id) {
        priest = ClassCreator.create('Priest').to_h()
        priest.id = this.generate_event_id()
        this.trash_events.push(priest)
      }
    })
  }

  process() {
    if (!_.isEmpty(this.trash_events)) {
      let mandatory_trash_events = _.filter(this.trash_events, function(event) {
        return _.includes(TrashEventProcessor.event_cards().concat(TrashEventProcessor.landmark_cards().concat(['Priest'])), event.name)
      })
      if (_.size(this.trash_events) === 1 && !_.isEmpty(mandatory_trash_events)) {
        TrashEventProcessor.trash_event(this.trasher.game, this.trasher.player_cards, this.trash_events, this)
      } else {
        GameModel.update(this.trasher.game._id, this.trasher.game)
        PlayerCardsModel.update(this.trasher.game._id, this.trasher.player_cards)
        let instructions = `Choose Trash Event To Resolve for ${CardView.render(this.card)}`
        let minimum = 1
        if (_.isEmpty(mandatory_trash_events)) {
          instructions += ' (or none to skip)'
          minimum = 0
        }
        let turn_event_id = TurnEventModel.insert({
          game_id: this.trasher.game._id,
          player_id: this.trasher.player_cards.player_id,
          username: this.trasher.player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: `${instructions}:`,
          cards: this.trash_events,
          minimum: minimum,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(this.trasher.game, this.trasher.player_cards, turn_event_id, this)
        turn_event_processor.process(TrashEventProcessor.trash_event)
      }
    }
  }

  static trash_event(game, player_cards, selected_cards, trash_event_processor) {
    if (!_.isEmpty(selected_cards)) {
      let card = selected_cards[0]
      let card_object = ClassCreator.create(card.name)
      if (_.includes(TrashEventProcessor.reaction_cards(), card.name)) {
        card_object.trash_reaction(game, player_cards, trash_event_processor.trasher, card)
      } else {
        card_object.trash_event(trash_event_processor.trasher, card)
      }
      let trash_event_index = _.findIndex(trash_event_processor.trash_events, function(event) {
        return event.id === card.id
      })
      trash_event_processor.trash_events.splice(trash_event_index, 1)

      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      trash_event_processor.process()
    }
  }

  generate_event_id() {
    let event_id = _.toString(this.event_id)
    this.event_id += 1
    return event_id
  }

}
