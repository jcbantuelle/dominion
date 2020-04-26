Teacher = class Teacher extends Reserve {

  types() {
    return this.capitalism_types(['action', 'reserve'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 6
  }

  play(game, player_cards, card_player) {
    Reserve.move_to_tavern(game, player_cards, card_player.card)
  }

  reserve(game, player_cards, teacher) {
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_yes_no',
      instructions: `Call ${CardView.render(teacher)}?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, teacher)
    turn_event_processor.process(Teacher.choose_token)
  }

  static choose_token(game, player_cards, response, teacher) {
    if (response === 'yes') {
      Reserve.call_from_tavern(game, player_cards, teacher)

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_options',
        instructions: `Choose which Token to move:`,
        minimum: 1,
        maximum: 1,
        options: [
          {text: '+1 card', value: 'card'},
          {text: '+1 action', value: 'action'},
          {text: '+1 buy', value: 'buy'},
          {text: '+$1', value: 'coin'}
        ]
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Teacher.choose_pile)
    }
  }

  static choose_pile(game, player_cards, response) {
    let token = response[0]

    let eligible_piles = _.filter(game.cards, function(card) {
      let has_player_token = _.some(card.tokens, function(pile_token) {
        return pile_token.username === player_cards.username
      })
      return !has_player_token && card.supply && _.includes(_.words(card.top_card.pile_types), 'action')
    })

    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_cards',
      game_cards: true,
      instructions: 'Choose a pile to place your token on:',
      cards: eligible_piles,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, token)
    turn_event_processor.process(Teacher.place_token)
  }

  static place_token(game, player_cards, response, token) {
    let token_placer = new TokenPlacer(game, player_cards, token, response[0])
    token_placer.place()
  }

}
