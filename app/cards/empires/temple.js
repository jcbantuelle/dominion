Temple = class Temple extends Card {

  types() {
    return ['action', 'gathering']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let victory_token_gainer = new VictoryTokenGainer(game, player_cards)
    victory_token_gainer.gain(1)

    let unique_cards = _.uniqBy(player_cards.hand, 'name')

    if (_.size(unique_cards) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose 1 to 3 cards to trash:',
        cards: unique_cards,
        minimum: 1,
        maximum: 3
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Temple.trash_cards)
    } else if (_.size(unique_cards) === 1) {
      Temple.trash_cards(game, player_cards, unique_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }

    let temple_index = _.findIndex(game.cards, (card) => {
      return card.name === 'Temple'
    })
    if (temple_index != -1) {
      game.cards[temple_index].victory_tokens += 1
    } else {
      game.log.push(`&nbsp;&nbsp;but there is no ${CardView.render(card_player.card)} pile`)
    }
  }

  static trash_cards(game, player_cards, selected_cards) {
    let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
    card_trasher.trash()
  }

  gain_event(gainer) {
    let temple_index = _.findIndex(gainer.game.cards, (card) => {
      return card.name === 'Temple'
    })
    if (temple_index != -1) {
      let victory_tokens = gainer.game.cards[temple_index].victory_tokens
      if (victory_tokens > 0) {
        gainer.game.cards[temple_index].victory_tokens = 0

        let victory_token_gainer = new VictoryTokenGainer(gainer.game, gainer.player_cards)
        victory_token_gainer.gain(victory_tokens)
      }
    }
  }

}
