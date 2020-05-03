Banish = class Banish extends Event {

  coin_cost() {
    return 4
  }

  buy(game, player_cards) {
    let unique_cards = _.uniqBy(player_cards.hand, 'name')
    
    var chosen_card
    if (_.size(unique_cards) > 1) {
      GameModel.update(game._id, game)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to exile:',
        cards: unique_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      chosen_card = turn_event_processor.process(Banish.choose_card)
    } else if (_.size(unique_cards) === 1) {
      chosen_card = unique_cards[0]
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }

    if (chosen_card) {
      let eligible_cards = _.filter(player_cards.hand, (card) => {
        return card.name === chosen_card.name
      })

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose any number of ${CardView.render(chosen_card)} to exile:`,
        cards: eligible_cards,
        minimum: 0,
        maximum: _.size(eligible_cards)
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      let exiled_cards = turn_event_processor.process(Banish.exile_cards)

      _.each(exiled_cards, (card) => {
        let card_mover = new CardMover(game, player_cards)
        card_mover.move(player_cards.hand, player_cards.exile, card)
      })
      if (!_.isEmpty(exiled_cards)) {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> exiles ${CardView.render(exiled_cards)}`)
      } else {
        game.log.push(`&nbsp;&nbsp;but chooses not to exile anything`)
      }
    }
  }

  static choose_card(game, player_cards, selected_cards) {
    return selected_cards[0]
  }

  static exile_cards(game, player_cards, selected_cards) {
    return selected_cards
  }

}
