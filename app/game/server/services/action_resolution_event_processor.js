ActionResolutionEventProcessor = class ActionResolutionEventProcessor {

  static reserve_events() {
    return ['Coin Of The Realm', 'Royal Carriage']
  }

  constructor(game, player_cards, resolved_action) {
    this.game = game
    this.player_cards = player_cards
    this.resolved_action = resolved_action
    this.find_action_resolution_events()
  }

  find_action_resolution_events() {
    let reserve_events = _.filter(this.player_cards.tavern, (card) => {
      if (_.contains(ActionResolutionEventProcessor.reserve_events(), card.inherited_name)) {
        if (card.inherited_name === 'Royal Carriage') {
          let still_in_play = _.findIndex(this.player_cards.playing, (playing_card) => {
            return playing_card.name === this.resolved_action.name
          })
          return still_in_play !== -1
        } else {
          return true
        }
      }
    })

    this.action_resolution_events = reserve_events
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
        let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id, {events: this.action_resolution_events, resolved_action: this.resolved_action})
        turn_event_processor.process(ActionResolutionEventProcessor.event_order)
      } else {
        ActionResolutionEventProcessor.event_order(this.game, this.player_cards, _.pluck(this.action_resolution_events, 'name'), {events: this.action_resolution_events, resolved_action: this.resolved_action})
      }
    }
  }

  static event_order(game, player_cards, event_name_order, params) {
    _.each(event_name_order, function(event_name) {
      let tavern_index = _.findIndex(player_cards.tavern, function(card) {
        return card.name === event_name
      })
      if (tavern_index !== -1) {
        let event_index = _.findIndex(params.events, function(event) {
          return event.name === event_name
        })
        let event = params.events.splice(event_index, 1)[0]
        if (event_name === 'Estate' && player_cards.tokens.estate) {
          event_name = 'InheritedEstate'
        }
        let selected_event = ClassCreator.create(event_name)
        selected_event.action_resolution_event(game, player_cards, params.resolved_action)
        GameModel.update(game._id, game)
        PlayerCardsModel.update(game._id, player_cards)
      }
    })
  }

}
