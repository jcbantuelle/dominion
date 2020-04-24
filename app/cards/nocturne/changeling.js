Changeling = class Changeling extends Card {

  types() {
    return ['night']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards, card_player) {
    let card_trasher = new CardTrasher(game, player_cards, 'in_play', card_player.card)
    card_trasher.trash()

    GameModel.update(game._id, game)

    if (_.size(player_cards.in_play) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        instructions: 'Choose a card to gain:',
        cards: player_cards.in_play,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Changeling.gain_card)
    } else if (_.size(player_cards.in_play) === 1) {
      Changeling.gain_card(game, player_cards, player_cards.in_play)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in play`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_to_gain = _.find(game.cards, (card) => {
      return selected_cards[0].name === card.top_card.name && card.supply
    })

    if (card_to_gain) {
      let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
      card_gainer.gain()
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses ${CardView.render(selected_cards)} but is unable to gain a copy`)
    }
  }

  gain_event(gainer, changeling) {
    let card_mover = new CardMover(gainer.game, gainer.player_cards)
    if (card_mover.return_to_supply(gainer.player_cards[gainer.destination], gainer.gained_card.stack_name, [gainer.gained_card])) {
      card_mover.take_from_supply(gainer.player_cards.discard, changeling)
      gainer.game.log.push(`&nbsp;&nbsp;<strong>${gainer.player_cards.username}</strong> exchanges ${CardView.render(gainer.gained_card)} for ${CardView.render(changeling)}`)
    }
  }

}
