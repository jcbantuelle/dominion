Treasurer = class Treasurer extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(3)

    GameModel.update(game._id, game)
    PlayerCardsModel.update(game._id, player_cards)

    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose One:`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: 'Trash a Treasure', value: 'trash'},
        {text: 'Gain a Treasure', value: 'gain'},
        {text: `Take the ${CardView.render(new Key())}`, value: 'key'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    let choice = turn_event_processor.process(Treasurer.process_response)

    if (choice === 'trash') {
      let eligible_cards = _.filter(player_cards.hand, (card) => {
        return _.includes(_.words(card.types), 'treasure')
      })

      if (_.size(eligible_cards) > 0) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose a treasure to trash (or none to skip):',
          cards: eligible_cards,
          minimum: 0,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Treasurer.trash_card)
      } else {
        game.log.push(`&nbsp;&nbsp;but does not trash a treasure`)
      }
    } else if (choice === 'gain') {
      let eligible_cards = _.filter(game.trash, (card) => {
        return _.includes(_.words(card.types), 'treasure')
      })
      if (_.size(eligible_cards) > 1) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose a treasure to gain:',
          cards: eligible_cards,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Treasurer.gain_trashed_treasure)
      } else if (_.size(eligible_cards) === 1) {
        Treasurer.gain_trashed_treasure(game, player_cards, eligible_cards)
      } else {
        game.log.push(`&nbsp;&nbsp;chooses to gain a treasure but there are none in the trash`)
      }
    } else {
      let card_mover = new CardMover(game, player_cards)
      card_mover.take_unique_card('artifacts', 'Key')
    }
  }

  static process_response(game, player_cards, response) {
    return response[0]
  }

  static trash_card(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
      card_trasher.trash()
    } else {
      game.log.push(`&nbsp;&nbsp;but does not trash a treasure`)
    }
  }

  static gain_trashed_treasure(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'hand', selected_cards[0].name)
    card_gainer.gain(game.trash)
  }

}
