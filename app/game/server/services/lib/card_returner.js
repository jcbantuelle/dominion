CardReturner = class CardReturner {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
  }

  return_to_deck(source, cards) {
    if (!cards) {
      cards = source
    } else if (!_.isArray(cards)) {
      cards = [cards]
    }
    if (_.size(cards) === 1) {
      CardReturner.return_ordered_cards_to_deck(this.game, this.player_cards, cards, source)
    } else if (_.size(cards) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: this.game._id,
        player_id: this.player_cards.player_id,
        username: this.player_cards.username,
        type: 'sort_cards',
        instructions: 'Choose order to place cards on deck: (leftmost will be top card)',
        cards: cards
      })
      let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id, source)
      turn_event_processor.process(CardReturner.return_ordered_cards_to_deck)
    }
  }

  static return_ordered_cards_to_deck(game, player_cards, ordered_cards, source) {
    let card_count = _.size(ordered_cards)
    _.each(ordered_cards.reverse(), function(ordered_card) {
      let card_mover = new CardMover(game, player_cards)
      card_mover.move(source, player_cards.deck, ordered_card)
    })
    let card_text = card_count === 1 ? 'card' : 'cards'
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places ${card_count} ${card_text} on their deck`)
  }

}