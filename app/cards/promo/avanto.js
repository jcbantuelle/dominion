Avanto = class Avanto extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  stack_name() {
    return 'Sauna/Avanto'
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(3)

    let sauna = _.find(player_cards.hand, function(card) {
      return card.name === 'Sauna'
    })
    if (sauna) {
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: `Play ${CardView.render(sauna)} from hand?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, {sauna: sauna, avanto: card_player.card})
      turn_event_processor.process(Avanto.play_sauna)
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to play a ${CardView.render(new Sauna())}`)
    }
  }

  static play_sauna(game, player_cards, response, params) {
    if (response === 'yes') {
      let card_player = new CardPlayer(game, player_cards, params.sauna, params.avanto)
      card_player.play(true)
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to play a ${CardView.render(params.sauna)}`)
    }
  }

}
