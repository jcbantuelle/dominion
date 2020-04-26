Governor = class Governor extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    GameModel.update(game._id, game)
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose One:`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: 'Draw 3 Cards', value: 'draw'},
        {text: 'Gain a Gold', value: 'gold'},
        {text: 'Trash a Card', value: 'trash'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(Governor.process_response)
  }

  static process_response(game, player_cards, response) {
    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, player_cards)

    _.each(ordered_player_cards, function(current_player_cards) {
      let is_active_player = current_player_cards.player_id === player_cards.player_id
      if (response[0] === 'draw') {
        let card_number = is_active_player ? 3 : 1
        let card_drawer = new CardDrawer(game, current_player_cards)
        card_drawer.draw(card_number)
      } else if (response[0] === 'gold') {
        let treasure = is_active_player ? 'Gold' : 'Silver'
        let card_gainer = new CardGainer(game, current_player_cards, 'discard', treasure)
        card_gainer.gain()
      } else if (response[0] === 'trash') {
        if (_.size(current_player_cards.hand) > 0) {
          let turn_event_id = TurnEventModel.insert({
            game_id: game._id,
            player_id: current_player_cards.player_id,
            username: current_player_cards.username,
            type: 'choose_cards',
            player_cards: true,
            instructions: 'Choose a card to trash (or none to skip):',
            cards: current_player_cards.hand,
            minimum: 0,
            maximum: 1
          })
          let turn_event_processor = new TurnEventProcessor(game, current_player_cards, turn_event_id)
          turn_event_processor.process(Governor.trash_card)
        } else {
          game.log.push(`&nbsp;&nbsp;<strong>${current_player_cards.username}</strong> has no cards in their hand`)
        }
      }
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, current_player_cards)
    })
  }

  static trash_card(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let is_active_player = game.turn.player._id === player_cards.player_id
      let remodel_amount = is_active_player ? 2 : 1

      let selected_card = selected_cards[0]

      let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_card)
      card_trasher.trash()

      let eligible_cards = _.filter(game.cards, function(card) {
        return card.count > 0 && card.supply && CardCostComparer.card_equal_to(game, selected_card, card.top_card, remodel_amount)
      })

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
        turn_event_processor.process(Governor.gain_card)
      } else if (_.size(eligible_cards) === 1) {
        Governor.gain_card(game, player_cards, eligible_cards)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but <strong>${player_cards.username}</strong> chooses not trash anything`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain()
  }

}
