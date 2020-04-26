SinisterPlot = class SinisterPlot extends Project {

  coin_cost() {
    return 4
  }

  start_turn_event(game, player_cards, sinister_plot) {
    game.log.push(`<strong>${player_cards.username}</strong> resolves ${CardView.render(sinister_plot)}`)

    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose One:`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: 'Add a token', value: 'token'},
        {text: `Remove tokens for +${player_cards.sinister_plot_tokens} cards`, value: 'draw'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    let choice = turn_event_processor.process(SinisterPlot.choose_option)

    if (choice === 'draw') {
      let token_text = player_cards.sinister_plot_tokens === 1 ? 'token' : 'tokens'
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> removes ${player_cards.sinister_plot_tokens} ${token_text}`)

      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(player_cards.sinister_plot_tokens)

      player_cards.sinister_plot_tokens = 0
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> adds a token to ${CardView.render(sinister_plot)}`)
      player_cards.sinister_plot_tokens += 1
    }
  }

  static choose_option(game, player_cards, response) {
    return response[0]
  }

}
