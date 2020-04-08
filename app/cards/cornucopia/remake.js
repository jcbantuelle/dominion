Remake = class Remake extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    this.choose_card(game, player_cards)
    GameModel.update(game._id, game)
    PlayerCardsModel.update(game._id, player_cards)
    this.choose_card(game, player_cards)
  }

  choose_card(game, player_cards) {
    if (_.size(player_cards.hand) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose a card to trash:`,
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Remake.trash_card)
    } else if (_.size(player_cards.hand) === 1) {
      Remake.trash_card(game, player_cards, player_cards.hand)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    let trashed_card = selected_cards[0]

    let card_trasher = new CardTrasher(game, player_cards, 'hand', trashed_card)
    card_trasher.trash()

    let eligible_cards = _.filter(game.cards, function(card) {
      return card.count > 0 && card.top_card.purchasable  && CardCostComparer.card_equal_to(game, trashed_card, card.top_card, 1)
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: `Choose a card to gain:`,
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Remake.gain_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain_game_card()
  }

}
