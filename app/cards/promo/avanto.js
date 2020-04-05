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

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(3)

    let has_sauna_in_hand = _.some(player_cards.hand, function(card) {
      return card.name === 'Sauna'
    })
    if (has_sauna_in_hand) {
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: `Play ${CardView.render(new Sauna())} from hand?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Avanto.play_sauna)
    }
  }

  static play_sauna(game, player_cards, response) {
    if (response === 'yes') {
      let card_player = new CardPlayer(game, player_cards, 'Sauna', true)
      card_player.play()
    }
  }

}
