Research = class Research extends Duration {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    let trashed_cards = []
    if (_.size(player_cards.hand) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Trash a card:',
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      trashed_cards = turn_event_processor.process(Research.trash_card)
    } else if (_.size(player_cards.hand) === 1) {
      trashed_cards = Research.trash_card(game, player_cards, player_cards.hand)
    } else {
      game.log.push(`&nbsp;&nbsp;but has no cards in hand`)
    }

    if (!_.isEmpty(trashed_cards)) {
      let coin_cost = CostCalculator.calculate(game, trashed_cards[0])

      let card_trasher = new CardTrasher(game, player_cards, 'hand', trashed_cards)
      card_trasher.trash()

      if (coin_cost > 0) {
        let card_revealer = new CardRevealer(game, player_cards)
        card_revealer.reveal_from_deck(coin_cost, false)

        if (!_.isEmpty(player_cards.revealed)) {
          let card_text = _.size(player_cards.revealed) === 1 ? 'card' : 'cards'
          game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside the top ${_.size(player_cards.revealed)} ${card_text} of their deck`)

          let research_effect = _.clone(card_player.card)
          research_effect.research_cards = _.clone(player_cards.revealed)

          let card_mover = new CardMover(game, player_cards)
          card_mover.move_all(player_cards.revealed, player_cards.research)

          player_cards.duration_effects.push(research_effect)
          return 'duration'
        }
      }
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    return selected_cards
  }

  duration(game, player_cards, research) {
    _.each(research.research_cards, (card) => {
      let card_mover = new CardMover(game, player_cards)
      card_mover.move(player_cards.research, player_cards.hand, card)
    })
    let card_text = _.size(research.research_cards) === 1 ? 'card' : 'cards'
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${_.size(research.research_cards)} ${card_text} in hand from ${CardView.render(research)}`)
  }

}
