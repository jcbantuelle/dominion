DiscardInPlayProcessor = class DiscardInPlayProcessor {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
    this.event_cards = ['Treasury', 'Herbalist']
    this.find_discard_events()
  }

  find_discard_events() {
    this.discard_events = _.filter(this.player_cards.in_play, (card) => {
      if (card.name === 'Treasury') {
        let victory_cards = _.filter(this.game.turn.bought_cards, function(card) {
          return _.contains(card.types, 'victory')
        })
        return _.isEmpty(victory_cards)
      } else if (card.name === 'Herbalist') {
        let treasures = _.filter(this.player_cards.in_play, function(card) {
          return _.contains(card.types, 'treasure')
        })
        return !_.isEmpty(treasures)
      }
    })
  }

  process_cards() {
    if (!_.isEmpty(this.discard_events)) {
      if (_.size(this.discard_events) === 1) {
        DiscardInPlayProcessor.discard_event(this.game, this.player_cards, this.discard_events, this)
      } else {
        let turn_event_id = TurnEvents.insert({
          game_id: this.game._id,
          player_id: this.player_cards.player_id,
          username: this.player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose Card to Resolve:',
          cards: this.discard_events,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id, this)
        turn_event_processor.process(DiscardInPlayProcessor.discard_event)
      }
    }
  }

  static discard_event(game, player_cards, selected_cards, discard_in_play_processor) {
    let discarding_card_index = _.findIndex(player_cards.in_play, function(card) {
      return card.name === selected_cards[0].name
    })
    player_cards.discarding = player_cards.in_play.splice(discarding_card_index, 1)

    let discard_event_index = _.findIndex(discard_in_play_processor.discard_events, function(card) {
      return card.name === selected_cards[0].name
    })
    discard_in_play_processor.discard_events.splice(discard_event_index, 1)

    let event_card = ClassCreator.create(player_cards.discarding[0].name)
    event_card.discard_from_play(game, player_cards)

    player_cards.discard = player_cards.discard.concat(player_cards.discarding)
    player_cards.discarding = []

    let treasures = _.filter(player_cards.in_play, function(card) {
      return _.contains(card.types, 'treasure')
    })
    if(_.isEmpty(treasures)) {
      discard_in_play_processor.discard_events = _.filter(discard_in_play_processor.discard_events, function(event) {
        return event.name !== 'Herbalist'
      })
    }
    Games.update(game._id, game)
    discard_in_play_processor.process_cards()
  }
}
