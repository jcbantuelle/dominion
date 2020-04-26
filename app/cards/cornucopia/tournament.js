Tournament = class Tournament extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    game.turn.self_revealed_province = false
    game.turn.opponent_revealed_province = false

    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, player_cards)
    _.each(ordered_player_cards, function(other_player_cards) {
      let province = _.find(other_player_cards.hand, function(card) {
        return card.name === 'Province'
      })
      if (province) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: other_player_cards.player_id,
          username: other_player_cards.username,
          type: 'choose_yes_no',
          instructions: `Reveal ${CardView.render(province)}?`,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, other_player_cards, turn_event_id, province)
        turn_event_processor.process(Tournament.reveal_province)
      } else {
        game.log.push(`&nbsp;&nbsp;<strong>${other_player_cards.username}</strong> does not reveal a ${CardView.render(new Province())}`)
      }
    })

    if (game.turn.self_revealed_province) {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand', game.turn.self_revealed_province)
      card_discarder.discard()

      let duchies = _.find(game.cards, (card) => {
        return card.name === 'Duchy'
      })
      let eligible_cards = _.clone(game.prizes)
      if (duchies.count > 0) {
        eligible_cards.push(duchies.top_card)
      }
      if (_.size(eligible_cards) > 0) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: `Choose a prize to gain: (or none to skip)`,
          cards: eligible_cards,
          minimum: 0,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Tournament.gain_prize)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no Prizes left to gain`)
      }
    }

    if (!game.turn.opponent_revealed_province) {
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(1)

      let coin_gainer = new CoinGainer(game, player_cards)
      coin_gainer.gain(1)
    }

    delete game.turn.self_revealed_province
    delete game.turn.opponent_revealed_province
  }

  static reveal_province(game, player_cards, response, province) {
    if (response === 'yes') {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal('hand', province)
      if (game.turn.player._id === player_cards.player_id) {
        game.turn.self_revealed_province = _.clone(province)
      } else {
        game.turn.opponent_revealed_province = true
      }
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> does not reveal a ${CardView.render(province)}`)
    }
  }

  static gain_prize(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let card_gainer = new CardGainer(game, player_cards, 'deck', selected_cards[0].name)
      if (selected_cards[0].name === 'Duchy') {
        card_gainer.gain()
      } else {
        card_gainer.gain(game.prizes)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to gain a Prize`)
    }
  }

}
