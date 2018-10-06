StartTurnEventProcessor = class StartTurnEventProcessor {

  static reserve_events() {
    return ['Teacher', 'Ratcatcher', 'Guide', 'Transmogrify']
  }

  static state_events() {
    return ['Lost In The Woods']
  }

  static artifact_events() {
    return ['Key']
  }

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
    this.find_start_turn_events()
  }

  find_start_turn_events() {
    let horse_traders_events = _.map(this.player_cards.horse_traders, function(card) {
      card.start_event_type = 'Horse Traders'
      return card
    })

    let saved_boon_events = _.map(this.player_cards.saved_boons, function(card) {
      card.start_event_type = 'Boon'
      return card
    })

    let duration_events = _.map(this.player_cards.duration_effects.concat(this.player_cards.permanent_duration_effects), function(card) {
      card.start_event_type = 'Duration'
      return card
    })

    let prince_events = _.map(this.player_cards.princed, function(card) {
      card.prince = true
      return card
    })

    let summon_events = _.map(this.player_cards.summon, function(card) {
      card.summon = true
      return card
    })

    let reserve_events = _.filter(this.player_cards.tavern, function(card) {
      card.start_event_type = 'Reserve'
      return _.includes(StartTurnEventProcessor.reserve_events(), card.inherited_name)
    })

    let state_events = _.filter(this.player_cards.states, function(card) {
      card.start_event_type = 'State'
      return _.includes(StartTurnEventProcessor.state_events(), card.name)
    })

    let artifact_events = _.filter(this.player_cards.artifacts, function(card) {
      card.start_event_type = 'Artifact'
      return _.includes(StartTurnEventProcessor.artifact_events(), card.name)
    })

    this.start_turn_events = horse_traders_events.concat(duration_events).concat(prince_events).concat(reserve_events).concat(summon_events).concat(state_events).concat(saved_boon_events).concat(artifact_events)
  }

  process() {
    if (!_.isEmpty(this.start_turn_events)) {
      if (_.size(this.start_turn_events) > 1) {
        let turn_event_id = TurnEventModel.insert({
          game_id: this.game._id,
          player_id: this.player_cards.player_id,
          username: this.player_cards.username,
          type: 'sort_cards',
          instructions: 'Choose order to resolve start of turn events (leftmost will be first):',
          cards: this.start_turn_events
        })
        let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id, this.start_turn_events)
        turn_event_processor.process(StartTurnEventProcessor.event_order)
      } else {
        StartTurnEventProcessor.event_order(this.game, this.player_cards, _.map(this.start_turn_events, 'name'), this.start_turn_events)
      }

      this.player_cards.princed = []
      this.player_cards.summon = []
    }
  }

  static event_order(game, player_cards, event_name_order, events) {
    _.each(event_name_order, function(event_name) {
      let event_index = _.findIndex(events, function(event) {
        return event.name === event_name
      })
      let event = events.splice(event_index, 1)[0]
      if (event_name === 'Estate' && player_cards.tokens.estate) {
        event_name = 'InheritedEstate'
      }
      let selected_event = ClassCreator.create(event_name)
      if (event.prince || event.summon) {
        delete event.summon
        player_cards.hand.push(event)
        let card_player = new CardPlayer(game, player_cards, event.name, true)
        card_player.play()
      } else if (event.start_event_type === 'Horse Traders') {
        delete event.start_event_type
        selected_event.start_turn_event(game, player_cards, player_cards.horse_traders.pop())
      } else if (event.start_event_type === 'Boon') {
        delete event.start_event_type
        let saved_boon_index = _.findIndex(player_cards.saved_boons, function(boon) {
          return boon.name === event.name
        })
        player_cards.saved_boons.splice(saved_boon_index, 1)
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> receives ${CardView.render(event, true)}`)
        GameModel.update(game._id, game)
        let keep_boon = selected_event.receive(game, player_cards)
        if (keep_boon) {
          player_cards.boons.push(event)
        } else {
          game.boons_discard.unshift(event)
        }
      } else if (event.start_event_type === 'Duration') {
        let duration_effect_index = _.findIndex(player_cards.duration_effects, function(duration_effect) {
          return duration_effect.name === selected_event.name()
        })
        player_cards.duration_effects.splice(duration_effect_index, 1)
        selected_event.duration(game, player_cards, event)
      } else if (event.start_event_type === 'Reserve') {
        delete event.start_event_type
        selected_event.reserve(game, player_cards)
      } else if (event.start_event_type === 'State' || event.start_event_type === 'Artifact') {
        delete event.start_event_type
        selected_event.start_turn_event(game, player_cards)
      }
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
    })
  }

}
