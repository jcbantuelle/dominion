DiscardEventProcessor = class DiscardEventProcessor {

  static event_cards() {
    return ['Treasury', 'Herbalist', 'Alchemist', 'Hermit', 'Tunnel']
  }

  static traveller_cards() {
    return [
      {name: 'Page', upgrade: 'Treasure Hunter'},
      {name: 'Treasure Hunter', upgrade: 'Warrior'},
      {name: 'Warrior', upgrade: 'Hero'},
      {name: 'Hero', upgrade: 'Champion'}
    ]
  }

  constructor(discarder, card) {
    this.discarder = discarder
    this.card = card
    this.find_discard_events()
  }

  find_discard_events() {
    this.discard_events = []
    if (_.contains(DiscardEventProcessor.event_cards(), this.card.name)) {
      if (this.card.name === 'Tunnel' && this.discarder.game.turn.phase !== 'cleanup') {
        this.discard_events.push(this.card)
      } else if (this.card.name === 'Treasury' && this.discarder.source === 'in_play') {
        let no_bought_victory_cards = !_.any(discarder.game.turn.bought_cards, function(card) {
          return _.contains(_.words(card.types), 'victory')
        })
        if (no_bought_victory_cards) {
          this.discard_events.push(this.card)
        }
      } else if (this.card.name === 'Herbalist' && this.discarder.source === 'in_play') {
        let has_treasures = _.any(this.discarder.player_cards.to_discard, function(card) {
          return _.contains(_.words(card.types), 'treasure')
        })
        if (has_treasures) {
          this.discard_events.push(this.card)
        }
      } else if (this.card.name === 'Alchemist' && this.discarder.source === 'in_play') {
        let has_potions = _.any(this.discarder.player_cards.to_discard, function(card) {
          return card.name === 'Potion'
        })
        if (has_potions) {
          this.discard_events.push(this.card)
        }
      } else if (this.card.name === 'Hermit' && this.discarder.source === 'in_play') {
        if (_.isEmpty(this.discarder.game.turn.bought_cards)) {
          this.discard_events.push(this.card)
        }
      }
    }

    if (this.discarder.source === 'in_play') {
      let traveller = _.find(DiscardEventProcessor.traveller_cards(), (traveller_card) => {
        return traveller_card.name === this.card.name
      })
      if (traveller) {
        let upgrade_stack = _.find(this.discarder.game.cards, function(stack) {
          return stack.name === traveller.upgrade
        })
        let discarding_upgrades = _.any(this.discarder.player_cards.to_discard, function(card) {
          return card.name === traveller.upgrade
        })
        if (upgrade_stack.count > 0 || discarding_upgrades) {
          this.discard_events.push(this.card)
        }
      }
    }
  }

  process() {
    if (!_.isEmpty(this.discard_events)) {
      if (_.size(this.discard_events) === 1) {
        DiscardEventProcessor.discard_event(this.discarder.game, this.discarder.player_cards, this.discard_events, this)
      } else {
        let turn_event_id = TurnEventModel.insert({
          game_id: this.discarder.game._id,
          player_id: this.discarder.player_cards.player_id,
          username: this.discarder.player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose Card to Resolve:',
          cards: this.discard_events,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(this.discarder.game, this.discarder.player_cards, turn_event_id, this)
        turn_event_processor.process(DiscardEventProcessor.discard_event)
      }
    }
  }

  static discard_event(game, player_cards, selected_cards, discard_event_processor) {
    let selected_card = ClassCreator.create(selected_cards[0].name)
    selected_card.discard_event(discard_event_processor.discarder)
    let discard_event_index = _.findIndex(discard_event_processor.discard_events, function(event) {
      return event.name === selected_cards[0].name
    })
    discard_event_processor.discard_events.splice(discard_event_index, 1)

    GameModel.update(game._id, game)
    PlayerCardsModel.update(game._id, player_cards)
    discard_event_processor.process()
  }
}
