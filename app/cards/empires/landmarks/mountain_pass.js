MountainPass = class MountainPass extends Landmark {

  start_bid(game) {
    game.log.push(`Bidding on ${CardView.render(this)}`)
    GameModel.update(game._id, game)

    let player_cards = game.mountain_pass
    game.mountain_pass = {
      player_cards: undefined,
      high_bid: 0
    }
    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, player_cards)
    ordered_player_cards.push(ordered_player_cards.shift())

    _.each(ordered_player_cards, (player_cards) => {
      if (game.mountain_pass.high_bid < 40) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_yes_no',
          instructions: `Bid on ${CardView.render(this)}`,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(MountainPass.will_bid)
        GameModel.update(game._id, game)
      }
    })

    if (game.mountain_pass.player_cards) {
      player_cards = game.mountain_pass.player_cards
      player_cards.debt_tokens += game.mountain_pass.high_bid
      player_cards.victory_tokens += 8
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +8 &nabla; and takes ${game.mountain_pass.high_bid} debt token(s)`)
      PlayerCardsModel.update(game._id, game.mountain_pass.player_cards)
    }
    delete game.mountain_pass
    GameModel.update(game._id, game)
  }

  static will_bid(game, player_cards, response) {
    if (response === 'yes') {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'overpay',
        instructions: 'Choose how many debt tokens to bid:',
        minimum: game.mountain_pass.high_bid + 1,
        maximum: 40
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(MountainPass.bid_tokens)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses to pass`)
    }
  }

  static bid_tokens(game, player_cards, amount) {
    amount = Number(amount)
    game.mountain_pass = {
      player_cards: player_cards,
      high_bid: amount
    }
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> bids ${amount} debt token(s)`)
  }

}
