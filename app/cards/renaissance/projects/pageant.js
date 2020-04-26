Pageant = class Pageant extends Project {

  coin_cost() {
    return 3
  }

  end_buy_event(game, player_cards, pageant) {
    if (game.turn.coins > 0) {
      game.log.push(`<strong>${player_cards.username}</strong> resolves ${CardView.render(pageant)}`)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: `Spend $1 for 1 Coffer?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      let choice = turn_event_processor.process(Pageant.process_choice)

      if (choice === 'yes') {
        game.turn.coins -= 1
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> spends $1`)

        let coffer_gainer = new CofferGainer(game, player_cards, pageant)
        coffer_gainer.gain(1)
      }
    }
  }

  static process_choice(game, player_cards, response) {
    return response
  }

}
