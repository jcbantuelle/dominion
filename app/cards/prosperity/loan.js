Loan = class Loan extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(1)

    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal_from_deck_until((game, player_cards, revealed_cards) => {
      if (!_.isEmpty(revealed_cards)) {
        return _.includes(_.words(_.last(revealed_cards).types), 'treasure')
      } else {
        return false
      }
    })

    let revealed_treasure = _.find(player_cards.revealed, (card) => {
      return _.includes(_.words(card.types), 'treasure')
    })

    if (revealed_treasure) {
      GameModel.update(game._id, game)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_options',
        instructions: `Trash or Discard ${CardView.render(revealed_treasure)}:`,
        minimum: 1,
        maximum: 1,
        options: [
          {text: 'Discard', value: 'discard'},
          {text: 'Trash', value: 'trash'}
        ]
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, revealed_treasure)
      turn_event_processor.process(Loan.process_response)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not have any treasures in their deck`)
    }

    let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
    card_discarder.discard()
  }

  static process_response(game, player_cards, response, revealed_treasure) {
    if (response[0] === 'trash') {
      let card_trasher = new CardTrasher(game, player_cards, 'revealed', revealed_treasure)
      card_trasher.trash()
    } else {
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed', revealed_treasure)
      card_discarder.discard()
    }
  }

}
