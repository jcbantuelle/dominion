Inheritance = class Inheritance extends Event {

  coin_cost() {
    return 7
  }

  buy(game, player_cards) {
    let eligible_cards = _.filter(game.cards, (card) => {
      return card.count > 0 && card.supply && _.includes(_.words(card.top_card.types), 'action') && !_.includes(_.words(card.top_card.types), 'command') && CardCostComparer.coin_less_than(game, card.top_card, 5)
    })

    if (_.size(eligible_cards) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: 'Choose a card to set aside:',
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Inheritance.set_aside)
    } else if (_.size(eligible_cards) === 1) {
      Inheritance.set_aside(game, player_cards, eligible_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to set aside`)
    }
  }

  static set_aside(game, player_cards, selected_cards) {
    let card_mover = new CardMover(game, player_cards)
    card_mover.take_from_supply(player_cards.inheritance, selected_cards[0].top_card)

    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside ${CardView.render(player_cards.inheritance)} and sets their estate token on it`)
    Inheritance.convert_estates(game, player_cards, true)
  }

  static convert_estates(game, player_cards, convert) {
    let turn_ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, player_cards)
    turn_ordered_player_cards.shift()
    turn_ordered_player_cards.unshift(player_cards)
    _.each(turn_ordered_player_cards, (next_player_cards) => {
      _.each(AllPlayerCardsQuery.card_sources(), (source) => {
        next_player_cards[source] = _.map(_.clone(next_player_cards[source]), (card) => {
          return Inheritance.convert_card(card, convert)
        })
      })
      PlayerCardsModel.update(game._id, next_player_cards)
    })

    game.trash = _.map(_.clone(game.trash), (card) => {
      return Inheritance.convert_card(card, convert)
    })

    game.cards = _.map(_.clone(game.cards), (pile) => {
      pile.stack = _.map(pile.stack, (card) => {
        return Inheritance.convert_card(card, convert)
      })
      pile.top_card = Inheritance.convert_card(pile.top_card, convert)
      return pile
    })
    GameModel.update(game._id, game)
  }

  static convert_card(card, convert) {
    let converted_card = card
    if (converted_card.name === 'Estate') {
      converted_card = convert ? Inheritance.add_action(converted_card) : Inheritance.remove_action(converted_card)
    }
    return converted_card
  }

  static add_action(card) {
    let card_types = _.words(card.types)
    card_types.push('action')
    card.types = card_types.join(' ')
    return card
  }

  static remove_action(card) {
    let card_types = _.filter(_.words(card.types), (card_type) => {
      return card_type !== 'action'
    })
    card.types = card_types.join(' ')
    return card
  }
}
