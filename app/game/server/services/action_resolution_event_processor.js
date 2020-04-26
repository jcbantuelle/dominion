ActionResolutionEventProcessor = class ActionResolutionEventProcessor {

  static reserve_events() {
    return ['Coin Of The Realm', 'Royal Carriage']
  }

  static project_events() {
    return ['Citadel']
  }

  constructor(game, player_cards, resolved_action) {
    this.game = game
    this.player_cards = player_cards
    this.resolved_action = resolved_action
    this.action_resolution_events = this.find_action_resolution_events()
  }

  find_action_resolution_events() {
    let action_resolution_events = []
    _.each(this.player_cards.tavern, (tavern_card) => {
      if (_.includes(ActionResolutionEventProcessor.reserve_events(), tavern_card.name)) {
        if (tavern_card.name === 'Royal Carriage') {
          let resolved_action = _.find(this.player_cards.in_play, (in_play_card) => {
            return in_play_card.id === this.resolved_action.id
          })
          if (resolved_action) {
            action_resolution_events.push(tavern_card)
          }
        } else {
          action_resolution_events.push(tavern_card)
        }
      }
    })

    _.each(this.player_cards.projects, (card) => {
      if (_.includes(ActionResolutionEventProcessor.project_events(), card.name)) {
        if (card.name === 'Citadel') {
          if (_.size(this.game.turn.played_actions) === 1) {
            action_resolution_events.push(card)
          }
        }
      }
    })

    return action_resolution_events
  }

  process() {
    if (!_.isEmpty(this.action_resolution_events)) {
      if (_.size(this.action_resolution_events) > 1) {
        let turn_event_id = TurnEventModel.insert({
          game_id: this.game._id,
          player_id: this.player_cards.player_id,
          username: this.player_cards.username,
          type: 'sort_cards',
          instructions: 'Choose order to resolve action events (leftmost will be first):',
          cards: this.action_resolution_events
        })
        let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id, this.resolved_action)
        turn_event_processor.process(ActionResolutionEventProcessor.event_order)
      } else {
        ActionResolutionEventProcessor.event_order(this.game, this.player_cards, this.action_resolution_events, this.resolved_action)
      }
    }
  }

  static event_order(game, player_cards, ordered_events, resolved_action) {
    _.each(ordered_events, function(ordered_event) {
      let card_object = ClassCreator.create(ordered_event.name)
      card_object.action_resolution_event(game, player_cards, ordered_event, resolved_action)
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
    })
  }

}
