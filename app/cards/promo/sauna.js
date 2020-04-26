Sauna = class Sauna extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  stack_name() {
    return 'Sauna/Avanto'
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    let avanto = _.find(player_cards.hand, (card) => {
      return card.name === 'Avanto'
    })
    if (avanto) {
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: `Play ${CardView.render(avanto)} from hand?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, {avanto: avanto, sauna: card_player.card})
      turn_event_processor.process(Sauna.play_avanto)
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to play an ${CardView.render(new Avanto())}`)
    }
  }

  static play_avanto(game, player_cards, response, params) {
    if (response === 'yes') {
      let card_player = new CardPlayer(game, player_cards, params.avanto, params.sauna)
      card_player.play(true)
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to play an ${CardView.render(params.avanto)}`)
    }
  }

}
