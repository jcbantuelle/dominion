Procession = class Procession extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let eligible_cards = _.filter(player_cards.hand, (card) => {
      return _.includes(_.words(card.types), 'action') && !_.includes(_.words(card.types), 'duration')
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to play two times: (or none to skip)',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card_player.card)
      turn_event_processor.process(Procession.play_twice)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not play an action`)
    }
  }

  static play_twice(game, player_cards, selected_cards, procession) {
    if (!_.isEmpty(selected_cards)) {
      let selected_card = selected_cards[0]

      let card_player = new CardPlayer(game, player_cards, selected_card, procession)
      card_player.play(true, true, 'hand', 2)

      let card_trasher = new CardTrasher(game, player_cards, 'in_play', selected_card)
      card_trasher.trash()

      let eligible_cards = _.filter(game.cards, (card) => {
        return card.count > 0 && card.supply && _.includes(_.words(card.top_card.types), 'action') && CardCostComparer.card_equal_to(game, selected_card, card.top_card, 1)
      })
      if (_.size(eligible_cards) > 1) {
        GameModel.update(game._id, game)
        PlayerCardsModel.update(game._id, player_cards)
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
        turn_event_processor.process(Procession.gain_card)
      } else if (_.size(eligible_cards) === 1) {
        Procession.gain_card(game, player_cards, eligible_cards)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no available actions to gain`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but does not play an action`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain()
  }

}
