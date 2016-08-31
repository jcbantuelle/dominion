Transmogrify = class Transmogrify extends Card {

  types() {
    return ['action', 'reserve']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, player) {
    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    this.move_to_tavern(game, player_cards, player.card.name())
  }

  reserve(game, player_cards, card_name = 'Transmogrify') {
    let tavern_card = this
    if (card_name === 'Estate') {
      tavern_card = _.find(player_cards.tavern, function(card) {
        return card.name === 'Estate'
      })
    }
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_yes_no',
      instructions: `Call ${CardView.render(tavern_card)}?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card_name)
    turn_event_processor.process(Transmogrify.call_card)
  }

  static call_card(game, player_cards, response, card_name) {
    if (response === 'yes') {
      let reserve_index = _.findIndex(player_cards.tavern, function(card) {
        return card.name === card_name
      })
      let reserve = player_cards.tavern.splice(reserve_index, 1)[0]
      game.log.push(`<strong>${player_cards.username}</strong> calls ${CardView.render(reserve)}`)
      player_cards.in_play.push(reserve)

      if (_.size(player_cards.hand) > 1) {
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
        turn_event_processor.process(Transmogrify.trash_card)
      } else if (_.size(player_cards.hand) === 1) {
        Transmogrify.trash_card(game, player_cards, player_cards.hand)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
      }
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    let selected_card = _.clone(selected_cards[0])
    let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_card.name)
    card_trasher.trash()

    let eligible_cards = _.filter(game.cards, function(card) {
      return card.count > 0 && card.top_card.purchasable && CardCostComparer.card_less_than(game, selected_card, card.top_card, 2)
    })

    if (_.size(eligible_cards) > 1) {
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
      turn_event_processor.process(Transmogrify.gain_card)
    } else if (_.size(eligible_cards) === 1) {
      Transmogrify.gain_card(game, player_cards, eligible_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'hand', selected_cards[0].name)
    card_gainer.gain_game_card()
  }

}
