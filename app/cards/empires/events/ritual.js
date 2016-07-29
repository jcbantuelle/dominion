Ritual = class Ritual extends Event {

  coin_cost() {
    return 4
  }

  buy(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Curse')
    let gained = card_gainer.gain_game_card()

    let eligible_cards = _.filter(game.cards, function(card) {
      return !_.includes(_.words(card.top_card.types), 'victory') && card.count > 0 && card.top_card.purchasable && CardCostComparer.coin_less_than(game, card.top_card, 6)
    })

    if (gained) {
      if (_.size(player_cards.hand) > 0) {
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
      } else {
        game.log.push(`&nbsp;&nbsp;but <strong>${player_cards.username}</strong> has no cards in hand`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but there is no ${CardView.card_html('curse', 'Curse')} to gain`)
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]

    let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_card.name)
    card_trasher.trash()

    let victory_tokens = CostCalculator.calculate(game, selected_card)

    if (game.turn.possessed) {
      possessing_player_cards = PlayerCardsModel.findOne(game._id, game.turn.possessed._id)
      possessing_player_cards.victory_tokens += victory_tokens
      game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> gets +${victory_tokens} &nabla;`)
      PlayerCardsModel.update(game._id, possessing_player_cards)
    } else {
      player_cards.victory_tokens += victory_tokens
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +${victory_tokens} &nabla;`)
    }
  }

}
