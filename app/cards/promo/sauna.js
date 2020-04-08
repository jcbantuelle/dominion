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

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    let avanto_in_hand = _.some(player_cards.hand, function(card) {
      return card.name === 'Avanto'
    })
    if (avanto_in_hand) {
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: `Play ${CardView.render(new Avanto())} from hand?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, avanto_in_hand)
      turn_event_processor.process(Sauna.play_avanto)
    }
  }

  static play_avanto(game, player_cards, response, avanto_in_hand) {
    if (response === 'yes') {
      let card_player = new CardPlayer(game, player_cards, avanto_in_hand.id, true)
      card_player.play()
    }
  }

}
