ReactionProcessor = class ReactionProcessor {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
    this.attack_reaction_cards = ['Moat']
  }

  process_attack_reactions() {
    let reaction_cards = _.filter(this.player_cards.hand, (card) => {
      return _.contains(this.attack_reaction_cards, card.name)
    })
    if (!_.isEmpty(reaction_cards)) {
      let turn_event_id = TurnEvents.insert({
        game_id: this.game._id,
        player_id: this.player_cards.player_id,
        username: this.player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose Attack Reaction (Or none to skip):',
        cards: reaction_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id)
      turn_event_processor.process(ReactionProcessor.attack_reaction)
    }
  }

  static attack_reaction(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let selected_card = ClassCreator.create(selected_cards[0].name)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals <span class="${selected_card.type_class()}">${selected_card.name()}</span>`)
      Games.update(game._id, game)
      selected_card.attack_reaction(game, player_cards)
      let reaction_processor = new ReactionProcessor(game, player_cards)
      reaction_processor.process_attack_reactions()
    }
  }
}
