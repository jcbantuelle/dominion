WouldGainReactionProcessor = class WouldGainReactionProcessor {

  constructor(gainer) {
    this.gainer = gainer
    this.would_gain_reaction_cards = ['Trader']
  }

  process() {
    let reaction_cards = _.filter(this.gainer.player_cards.hand, (card) => {
      return _.contains(this.would_gain_reaction_cards, card.name)
    })
    if (!_.isEmpty(reaction_cards)) {
      let gained_card = ClassCreator.create(this.gainer.card_name)
      let turn_event_id = TurnEvents.insert({
        game_id: this.gainer.game._id,
        player_id: this.gainer.player_cards.player_id,
        username: this.gainer.player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose Reaction To Gaining ${CardView.render(gained_card)} (Or none to skip):`,
        cards: reaction_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(this.gainer.game, this.gainer.player_cards, turn_event_id, this)
      turn_event_processor.process(WouldGainReactionProcessor.would_gain_reaction)
    }
  }

  static would_gain_reaction(game, player_cards, selected_cards, would_gain_reaction_processor) {
    if (!_.isEmpty(selected_cards)) {
      let selected_card = ClassCreator.create(selected_cards[0].name)
      selected_card.would_gain_reaction(game, player_cards, would_gain_reaction_processor.gainer)
      GameModel.update(game._id, game)
      would_gain_reaction_processor.process()
    }
  }

}
