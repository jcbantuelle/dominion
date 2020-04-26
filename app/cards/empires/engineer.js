Engineer = class Engineer extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 0
  }

  debt_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    Engineer.choose_gain_card(game, player_cards)

    let engineer = _.find(player_cards.in_play, (card) => {
      return card.id === card_player.card.id
    })
    if (engineer) {
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: `Trash ${CardView.render(engineer)}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, engineer)
      turn_event_processor.process(Engineer.trash_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but ${card_player.card} is not in play`)
    }
  }

  static choose_gain_card(game, player_cards) {
    let eligible_cards = _.filter(game.cards, function(card) {
      return card.count > 0 && card.supply && CardCostComparer.coin_less_than(game, card.top_card, 5)
    })

    if (_.size(eligible_cards) > 0) {
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
      turn_event_processor.process(Engineer.gain_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain()
  }

  static trash_card(game, player_cards, response, engineer) {
    if (response === 'yes') {
      let card_trasher = new CardTrasher(game, player_cards, 'in_play', engineer)
      card_trasher.trash()

      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      Engineer.choose_gain_card(game, player_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses not to trash ${CardView.render(engineer)}`)
    }
  }

}
