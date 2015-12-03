DiscardInPlayProcessor = class DiscardInPlayProcessor {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
    this.event_cards = ['Treasury', 'Herbalist', 'Alchemist', 'Hermit']
    this.find_discard_events()
  }

  find_discard_events() {
    this.discard_events = _.filter(this.player_cards.in_play, (card) => {
      if (_.contains(this.event_cards, card.name)) {
        if (card.name === 'Treasury') {
          return !_.any(this.game.turn.bought_cards, function(card) {
            return _.contains(card.types, 'victory')
          })
        } else if (card.name === 'Herbalist') {
          return _.any(this.player_cards.in_play, function(card) {
            return _.contains(card.types, 'treasure')
          })
        } else if (card.name === 'Alchemist') {
          return _.any(this.player_cards.in_play, function(card) {
            return card.name === 'Potion'
          })
        } else if (card.name === 'Hermit') {
          return _.isEmpty(this.game.turn.bought_cards)
        } else {
          return true
        }
      } else {
        return false
      }
    })
  }

  process_cards() {
    if (!_.isEmpty(this.discard_events)) {
      if (_.size(this.discard_events) === 1) {
        DiscardInPlayProcessor.discard_event(this.game, this.player_cards, this.discard_events, this)
      } else {
        let turn_event_id = TurnEventModel.insert({
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

    DiscardInPlayProcessor.purge_invalid_discard_events(game, player_cards, discard_in_play_processor)

    GameModel.update(game._id, game)
    discard_in_play_processor.process_cards()
  }

  static purge_invalid_discard_events(game, player_cards, discard_in_play_processor) {
    let treasures = _.any(player_cards.in_play, function(card) {
      return _.contains(card.types, 'treasure')
    })
    if (!treasures) {
      discard_in_play_processor.discard_events = _.filter(discard_in_play_processor.discard_events, function(event) {
        return event.name !== 'Herbalist'
      })
    }

    let potions = _.any(player_cards.in_play, function(card) {
      return card.name === 'Potion'
    })
    if (!potions) {
      discard_in_play_processor.discard_events = _.filter(discard_in_play_processor.discard_events, function(event) {
        return event.name !== 'Alchemist'
      })
    }
  }
}
