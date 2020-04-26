Ritual = class Ritual extends Event {

  coin_cost() {
    return 4
  }

  buy(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Curse')
    let gained = card_gainer.gain()

    if (gained && gained.name === 'Curse') {
      if (_.size(player_cards.hand) > 1) {
        GameModel.update(game._id, game)
        PlayerCardsModel.update(game._id, player_cards)
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose a card to trash:',
          cards: player_cards.hand,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Ritual.trash_card)
      } else if (_.size(player_cards.hand) === 1) {
        Ritual.trash_card(game, player_cards, player_cards.hand)
      } else {
        game.log.push(`&nbsp;&nbsp;but <strong>${player_cards.username}</strong> has no cards in hand`)
      }
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    let victory_tokens = CostCalculator.calculate(game, selected_cards[0])

    let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
    card_trasher.trash()

    let victory_token_gainer = new VictoryTokenGainer(game, player_cards)
    victory_token_gainer.gain(victory_tokens)
  }

}
