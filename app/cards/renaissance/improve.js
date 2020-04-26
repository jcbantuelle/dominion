Improve = class Improve extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2)

    game.turn.improves += 1
  }

  start_cleanup_event(game, player_cards, improve) {
    let actions_to_discard = _.filter(player_cards.in_play, (card) => {
      return _.includes(_.words(card.types), 'action') && !ClassCreator.create(card.name).stay_in_play(game, player_cards, card)
    })
    if (_.size(actions_to_discard) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose an action to trash from play for ${CardView.render(improve)}: (or none to skip)`,
        cards: actions_to_discard,
        minimum: 0,
        maximum: 0
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, improve)
      turn_event_processor.process(Improve.trash_card)
    }
  }

  static trash_card(game, player_cards, selected_cards, improve) {
    if (_.size(selected_cards) > 0) {
      game.log.push(`<strong>${player_cards.username}</strong> resolves ${CardView.render(improve)}`)
      let eligible_cards = _.filter(game.cards, (card) => {
        return card.count > 0 && card.supply  && CardCostComparer.card_equal_to(game, selected_cards[0], card.top_card, 1)
      })

      let card_trasher = new CardTrasher(game, player_cards, 'in_play', selected_cards)
      card_trasher.trash()

      if (_.size(eligible_cards) > 1) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          game_cards: true,
          instructions: 'Choose a card to gain:',
          cards: eligible_cards,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Improve.gain_card)
      } else if (_.size(eligible_cards) === 1) {
        Improve.gain_card(game, player_cards, eligible_cards)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
      }
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain()
  }

}
