Journeyman = class Journeyman extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    if (_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) {
      let unique_cards = _.uniqBy(AllPlayerCardsQuery.find(player_cards), 'name')

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Name a card: (or none to avoid skipping cards)',
        cards: unique_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Journeyman.reveal_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in deck to reveal`)
    }
  }

  static reveal_cards(game, player_cards, selected_cards) {
    let revealed_card_name
    if (!_.isEmpty(selected_cards)) {
      named_card = selected_cards[0].name
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> names ${CardView.render(selected_cards)}`)
    } else {
      named_card = ''
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> does not name a card`)
    }

    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal_from_deck_until((game, player_cards, revealed_cards, named_card) => {
      let unnamed_cards = _.filter(revealed_cards, (card) => {
        return card.name !== named_card
      })
      return _.size(unnamed_cards) === 3
    }, true, named_card)

    let unnamed_cards = []
    _.each(_.clone(player_cards.revealed), (card) => {
      if (card.name !== named_card) {
        let card_mover = new CardMover(game, player_cards)
        card_mover.move(player_cards.revealed, player_cards.hand, card)
        unnamed_cards.push(card)
      }
    })
    if (!_.isEmpty(unnamed_cards)) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(unnamed_cards)} in hand`)
    }

    let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
    card_discarder.discard()
  }

}
