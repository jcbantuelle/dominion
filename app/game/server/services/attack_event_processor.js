AttackEventProcessor = class AttackEventProcessor {

  static attack_reactions() {
    return ['Moat', 'Secret Chamber']
  }

  static find_attack_events(player_cards) {
    let attack_events = []

    _.each(player_cards.hand, (card) => {
      if (_.contains(AttackEventProcessor.attack_reactions(), card.name)) {
        attack_events.push(card)
      }
    })

    return attack_events
  }

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
  }

  process() {
    let attack_events = AttackEventProcessor.find_attack_events(this.player_cards)
    if (!_.isEmpty(attack_events)) {
      let turn_event_id = TurnEvents.insert({
        game_id: this.game._id,
        player_id: this.player_cards.player_id,
        username: this.player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose Attack Event To Resolve (Or none to skip):',
        cards: attack_events,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id, this)
      turn_event_processor.process(AttackEventProcessor.attack_event)
    }
  }

  static attack_event(game, player_cards, selected_cards, attack_event_processor) {
    if (!_.isEmpty(selected_cards)) {
      let selected_card = ClassCreator.create(selected_cards[0].name)
      selected_card.attack_event(game, player_cards)

      GameModel.update(game._id, game)
      PlayerCards.update(player_cards._id, player_cards)
      attack_event_processor.process()
    }
  }
}
