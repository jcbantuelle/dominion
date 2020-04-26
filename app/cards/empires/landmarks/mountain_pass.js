MountainPass = class MountainPass extends Landmark {

  between_turn_event(game, player_cards, mountain_pass) {
    game.log.push(`Bidding on ${CardView.render(mountain_pass)}`)
    GameModel.update(game._id, game)

    game.mountain_pass = {
      player_cards: undefined,
      high_bid: 0
    }
    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, mountain_pass.purchasing_player)
    ordered_player_cards.push(ordered_player_cards.shift())

    _.each(ordered_player_cards, (player_cards) => {
      if (game.mountain_pass.high_bid < 40) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_yes_no',
          instructions: `Bid on ${CardView.render(mountain_pass)}`,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(MountainPass.will_bid)
        GameModel.update(game._id, game)
      }
    })

    if (game.mountain_pass.player_cards) {
      winning_player = game.mountain_pass.player_cards

      let victory_token_gainer = new VictoryTokenGainer(game, player_cards, mountain_pass)
      victory_token_gainer.gain(8)

      let debt_token_gainer = new DebtTokenGainer(game, winning_player, mountain_pass)
      debt_token_gainer.gain(game.mountain_pass.high_bid)

      PlayerCardsModel.update(game._id, winning_player)
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
    let token_text = amount === 1 ? 'token' : 'tokens'
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> bids ${amount} debt ${token_text}`)
  }

}
