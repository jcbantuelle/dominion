Lurker = class Lurker extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose One:`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: 'Trash an action card from the supply', value: 'trash'},
        {text: 'Gain an action card from the trash', value: 'gain'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(Lurker.process_choice)
  }

  static process_choice(game, player_cards, choice) {
    choice = choice[0]
    if (choice === 'gain') {
      let eligible_cards = _.filter(game.trash, function(card) {
        return _.includes(_.words(card.types), 'action')
      })

      if (_.size(eligible_cards) > 1) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          instructions: 'Choose a card to gain:',
          cards: eligible_cards,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Lurker.gain_from_trash)
      } else if (_.size(eligible_cards) === 1) {
        Lurker.gain_from_trash(game, player_cards, eligible_cards)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
      }
    } else if (choice === 'trash') {
      let eligible_cards = _.filter(game.cards, function(card) {
        return _.includes(_.words(card.top_card.types), 'action') && card.count > 0 && card.top_card.purchasable
      })
      if (_.size(eligible_cards) > 0) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          game_cards: true,
          instructions: 'Choose an action card to trash:',
          cards: eligible_cards,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Lurker.trash_card)
      } else {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses to trash an action card, but there are none available`)
      }
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    let supply_card_trasher = new SupplyCardTrasher(game, player_cards, selected_cards[0].stack_name, selected_cards[0].top_card)
    supply_card_trasher.trash()
  }

  static gain_from_trash(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'deck', selected_cards[0].name)
    card_gainer.gain_trash_card()
  }

}
