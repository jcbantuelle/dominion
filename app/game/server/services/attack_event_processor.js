AttackEventProcessor = class AttackEventProcessor {

  static attack_reactions() {
    return ['Moat', 'Secret Chamber', 'Horse Traders', 'Beggar', 'Caravan Guard', 'Diplomat']
  }

  static find_attack_events(player_cards) {
    let attack_events = []

    _.each(player_cards.hand, (card) => {
      if (_.includes(AttackEventProcessor.attack_reactions(), card.name)) {
        if (card.name === 'Diplomat') {
          if (_.size(player_cards.hand) > 4) {
            attack_events.push(card)
          }
        } else {
          attack_events.push(card)
        }
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
      let turn_event_id = TurnEventModel.insert({
        game_id: this.game._id,
        player_id: this.player_cards.player_id,
        username: this.player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose Attack Event To Resolve (or none to skip):',
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
      let card = selected_cards[0]
      let selected_card = ClassCreator.create(card.name)
      selected_card.attack_event(game, player_cards, card)

      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      attack_event_processor.process()
    }
  }
}
