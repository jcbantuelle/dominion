Quest = class Quest extends Event {

  coin_cost() {
    return 0
  }

  buy(game, player_cards) {
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose One (or none to skip):`,
      minimum: 0,
      maximum: 1,
      options: [
        {text: 'Discard an Attack', value: 'attack'},
        {text: 'Discard 2 Curses', value: 'curses'},
        {text: 'Discard 6 Cards', value: 'cards'},
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(Quest.process_response)
  }

  static process_response(game, player_cards, response) {
    response = response[0]
    if (response === 'attack') {
      let attacks = _.filter(player_cards.hand, function(card) {
        return _.includes(_.words(card.types), 'attack')
      })
      if (_.size(attacks) > 1) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose an attack to discard:',
          cards: attacks,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, response)
        turn_event_processor.process(Quest.discard_cards)
      } else if (_.size(attacks) === 1) {
        Quest.discard_cards(game, player_cards, attacks, response)
      } else {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses to discard an attack, but has none in hand`)
      }
    } else if (response === 'curses') {
      let curses = _.take(_.filter(player_cards.hand, function(card) {
        return card.name === 'Curse'
      }), 2)
      if (_.size(curses) > 0) {
        Quest.discard_cards(game, player_cards, curses, response)
      } else {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses to discard two curses, but has none in hand`)
      }
    } else if (response === 'cards') {
      if (_.size(player_cards.hand) > 6) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose 6 cards to discard:',
          cards: player_cards.hand,
          minimum: 6,
          maximum: 6
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, response)
        turn_event_processor.process(Quest.discard_cards)
      } else if (_.size(player_cards.hand) > 0) {
        Quest.discard_cards(game, player_cards, player_cards.hand, response)
      } else {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses to discard 6 cards, but has an empty hand`)
      }
    }
  }

  static discard_cards(game, player_cards, selected_cards, selection) {
    let discard_count = _.size(selected_cards)
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
    card_discarder.discard()

    if ((selection === 'attack' && discard_count > 0) || (selection === 'curses' && discard_count === 2) || (selection === 'cards' && discard_count === 6)) {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Gold')
      card_gainer.gain()
    }
  }
}
