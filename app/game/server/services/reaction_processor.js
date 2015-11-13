ReactionProcessor = class ReactionProcessor {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
    this.attack_reaction_cards = ['Moat']
    this.gain_reaction_cards = ['Fools Gold']
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
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(selected_card)}`)
      Games.update(game._id, game)
      selected_card.attack_reaction(game, player_cards)
      let reaction_processor = new ReactionProcessor(game, player_cards)
      reaction_processor.process_attack_reactions()
    }
  }

  process_gain_reactions() {
    let reaction_cards = _.filter(this.player_cards.hand, (card) => {
      return _.contains(this.gain_reaction_cards, card.name) && this.allow_fools_gold(card)
    })
    if (!_.isEmpty(reaction_cards)) {
      Games.update(this.game._id, this.game)
      let turn_event_id = TurnEvents.insert({
        game_id: this.game._id,
        player_id: this.player_cards.player_id,
        username: this.player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose Gain Reaction (Or none to skip):',
        cards: reaction_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id)
      turn_event_processor.process(ReactionProcessor.gain_reaction)
    }
  }

  static gain_reaction(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let selected_card = ClassCreator.create(selected_cards[0].name)
      selected_card.gain_reaction(game, player_cards)
      Games.update(game._id, game)
      PlayerCards.update(player_cards._id, player_cards)
      let reaction_processor = new ReactionProcessor(game, player_cards)
      reaction_processor.process_gain_reactions()
    }
  }

  allow_fools_gold(reaction_card) {
    return reaction_card.name !== 'Fools Gold' || (this.player_cards.player_id !== this.game.turn.player._id && _.last(this.game.turn.gain_reaction_stack) === 'Province')
  }

  static discard_reaction(game, player_cards, card) {
    let reaction_card = ClassCreator.create(card.name)
    reaction_card.discard_reaction(game, player_cards)
    Games.update(game._id, game)
    PlayerCards.update(player_cards._id, player_cards)
  }
}
