Replace = class Replace extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
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
      turn_event_processor.process(Replace.trash_card)
    } else if (_.size(player_cards.hand) === 1) {
      Replace.trash_card(game, player_cards, player_cards.hand)
    } else {
      game.log.push(`&nbsp;&nbsp;but has no cards in hand`)
    }

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)

    delete game.turn.replace_attack
  }

  static trash_card(game, player_cards, selected_cards) {
    let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards[0])
    card_trasher.trash()

    let eligible_cards = _.filter(game.cards, function(card) {
      return card.count > 0 && card.supply && CardCostComparer.card_less_than(game, selected_cards[0], card.top_card, 3)
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
      turn_event_processor.process(Replace.gain_card)
    } else if (_.size(eligible_cards) === 1) {
      Replace.gain_card(game, player_cards, eligible_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    let selected_card_types = _.words(selected_card.top_card.types)
    let destination = _.includes(selected_card_types, 'action') || _.includes(selected_card_types, 'treasure') ? 'deck' : 'discard'
    let card_gainer = new CardGainer(game, player_cards, destination, selected_card.name)
    card_gainer.gain()

    if (_.includes(selected_card_types, 'victory')) {
      game.turn.replace_attack = true
    }
  }

  attack(game, player_cards) {
    if (game.turn.replace_attack) {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Curse')
      card_gainer.gain()
    }
  }

}
