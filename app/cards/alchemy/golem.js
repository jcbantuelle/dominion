Golem = class Golem extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  potion_cost() {
    return 1
  }

  play(game, player_cards) {
    let has_cards = this.reveal(game, player_cards)

    if (has_cards) {

      let card_discarder = new CardDiscarder(game, player_cards, 'revealed', _.pluck(player_cards.revealed, 'name'))
      card_discarder.discard()

      GameModel.update(game._id, game)

      if (player_cards.second_golem_card) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_options',
          instructions: `Choose which card to play first:`,
          minimum: 1,
          maximum: 1,
          options: [
            {text: `${CardView.render(player_cards.first_golem_card)}`, value: 'first'},
            {text: `${CardView.render(player_cards.second_golem_card)}`, value: 'second'}
          ]
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Golem.choose_first_action)
      } else if (player_cards.first_golem_card) {
        player_cards.hand.push(player_cards.first_golem_card)
        let card_player = new CardPlayer(game, player_cards, player_cards.first_golem_card.name, true)
        delete player_cards.first_golem_card
        card_player.play()
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no action cards to play`)
      }
    }
  }

  reveal(game, player_cards) {
    let revealed_cards = []
    while((_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) && !player_cards.second_golem_card) {
      if (_.size(player_cards.deck) === 0) {
        DeckShuffler.shuffle(player_cards)
      }
      let card = player_cards.deck.shift()
      revealed_cards.push(card)
      if (_.contains(_.words(card.types), 'action') && card.name !== 'Golem') {
        if (player_cards.first_golem_card) {
          player_cards.second_golem_card = card
        } else {
          player_cards.first_golem_card = card
        }
      } else {
        player_cards.revealed.push(card)
      }
    }
    if (_.isEmpty(revealed_cards)) {
      game.log.push(`&nbsp;&nbsp;but there are no cards in their deck`)
      return false
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(revealed_cards)}`)
      return true
    }
  }

  static choose_first_action(game, player_cards, response) {
    response = response[0]
    var first_played_card
    var second_played_card

    if (response === 'first') {
      first_played_card = player_cards.first_golem_card
      second_played_card = player_cards.second_golem_card
    } else if (response === 'second') {
      first_played_card = player_cards.second_golem_card
      second_played_card = player_cards.first_golem_card
    }

    delete player_cards.first_golem_card
    delete player_cards.second_golem_card

    _.each([first_played_card, second_played_card], function(card) {
      player_cards.hand.push(card)
      let card_player = new CardPlayer(game, player_cards, card.name, true)
      card_player.play()
    })
  }

}
