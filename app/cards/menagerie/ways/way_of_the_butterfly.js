WayOfTheButterfly = class WayOfTheButterfly extends Way {

  play(game, player_cards, card_player) {
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_yes_no',
      instructions: `Return ${CardView.render(card_player.card)} to the Supply?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    let choice = turn_event_processor.process(WayOfTheButterfly.return_to_supply)

    if (choice === 'yes') {
      let card_mover = new CardMover(game, player_cards)
      let return_count = card_mover.return_to_supply(player_cards.in_play, card_player.card.name, [card_player.card])

      if (return_count === 1) {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> returns ${CardView.render(card_player.card)} to the ${CardView.render(card_player.card)} pile`)

        let eligible_cards = _.filter(game.cards, (card) => {
          return card.count > 0 && card.supply && CardCostComparer.card_equal_to(game, card_player.card, card.top_card, 1)
        })

        if (_.size(eligible_cards) > 1) {
          GameModel.update(game._id, game)
          PlayerCardsModel.update(game._id, player_cards)
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
          turn_event_processor.process(WayOfTheButterfly.gain_card)
        } else if (_.size(eligible_cards) === 1) {
          WayOfTheButterfly.gain_card(game, player_cards, eligible_cards)
        } else {
          game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
        }
      } else {
        game.log.push(`&nbsp;&nbsp;chooses to return ${CardView.render(card_player.card)} to the Supply but is unable to`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to return ${CardView.render(card_player.card)} to the Supply`)
    }
  }

  static return_to_supply(game, player_cards, response) {
    return response
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain()
  }

}
