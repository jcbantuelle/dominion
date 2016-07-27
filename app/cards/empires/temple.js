Temple = class Temple extends Card {

  types() {
    return ['action', 'gathering']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    if (game.turn.possessed) {
      possessing_player_cards = PlayerCardsModel.findOne(game._id, game.turn.possessed._id)
      possessing_player_cards.victory_tokens += 1
      game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> gets +1 &nabla;`)
      PlayerCardsModel.update(game._id, possessing_player_cards)
    } else {
      player_cards.victory_tokens += 1
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 &nabla;`)
    }

    if (_.size(player_cards.hand) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose 1 to 3 cards to trash:',
        cards: player_cards.hand,
        minimum: 1,
        maximum: 3
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Temple.trash_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }

    let temple_index = _.findIndex(game.cards, (card) => {
      return card.name === 'Temple'
    })
    if (temple_index != -1) {
      game.cards[temple_index].victory_tokens += 1
    } else {
      game.log.push(`&nbsp;&nbsp;but there is no ${CardView.render(this)} pile`)
    }
  }

  static trash_cards(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;but does not trash anything`)
    } else {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', _.map(selected_cards, 'name'))
      card_trasher.trash()
    }
  }

  gain_event(gainer) {
    let temple_index = _.findIndex(gainer.game.cards, (card) => {
      return card.name === 'Temple'
    })
    if (temple_index != -1) {
      let victory_tokens = gainer.game.cards[temple_index].victory_tokens
      if (victory_tokens > 0) {
        gainer.game.cards[temple_index].victory_tokens = 0

        if (gainer.game.turn.possessed) {
          possessing_player_cards = PlayerCardsModel.findOne(gainer.game._id, gainer.game.turn.possessed._id)
          possessing_player_cards.victory_tokens += victory_tokens
          gainer.game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> gets +${victory_tokens} &nabla;`)
          PlayerCardsModel.update(gainer.game._id, possessing_player_cards)
        } else {
          gainer.player_cards.victory_tokens += victory_tokens
          gainer.game.log.push(`&nbsp;&nbsp;<strong>${gainer.player_cards.username}</strong> gets +${victory_tokens} &nabla;`)
        }
      }
    }
  }

}
