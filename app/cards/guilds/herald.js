Herald = class Herald extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    if (_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(1)

      if (_.includes(_.words(player_cards.revealed[0].types), 'action')) {
        GameModel.update(game._id, game)
        PlayerCardsModel.update(game._id, player_cards)
        let card_player = new CardPlayer(game, player_cards, player_cards.revealed[0])
        card_player.play(true, true, 'revealed')
      } else {
        let card_mover = new CardMover(game, player_cards)
        card_mover.move(player_cards.revealed, player_cards.deck, player_cards.revealed[0])
        game.log.push(`&nbsp;&nbsp;putting it back on top of their deck`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in deck`)
    }
  }

  buy_event(buyer) {
    if (buyer.game.turn.coins > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: buyer.game._id,
        player_id: buyer.player_cards.player_id,
        username: buyer.player_cards.username,
        type: 'overpay',
        player_cards: true,
        instructions: 'Choose an amount to overpay by:',
        minimum: 0,
        maximum: buyer.game.turn.coins
      })
      let turn_event_processor = new TurnEventProcessor(buyer.game, buyer.player_cards, turn_event_id)
      turn_event_processor.process(Herald.overpay)
    }
  }

  static overpay(game, player_cards, amount) {
    amount = Number(amount)
    if (amount > 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> overpays by $${amount}`)
      game.turn.coins -= amount

      if (_.size(player_cards.discard) > amount) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: `Choose ${amount} cards to put on your deck:`,
          cards: player_cards.discard,
          minimum: amount,
          maximum: amount
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Herald.take_discarded_cards)
      } else if (_.size(player_cards.discard) > 0) {
        Herald.take_discarded_cards(game, player_cards, player_cards.discard)
      } else {
        game.log.push(`&nbsp;&nbsp;but does not have any cards in their discard`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but does not overpay`)
    }
  }

  static take_discarded_cards(game, player_cards, selected_cards) {
    let card_returner = new CardReturner(game, player_cards)
    card_returner.return_to_deck(player_cards.discard, selected_cards)
  }

}
