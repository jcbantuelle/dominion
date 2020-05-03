Moneylender = class Moneylender extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let copper = _.find(player_cards.hand, (card) => {
      return card.name === 'Copper'
    })

    if (copper) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: game.turn.player._id,
        username: game.turn.player.username,
        type: 'choose_yes_no',
        instructions: `Trash a ${CardView.render(copper)}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      let response = turn_event_processor.process(Moneylender.trash_copper)

      if (response === 'yes') {
        let card_trasher = new CardTrasher(game, player_cards, 'hand', copper)
        card_trasher.trash()

        let coin_gainer = new CoinGainer(game, player_cards, card_player)
        coin_gainer.gain(3)
      } else {
        game.log.push(`&nbsp;&nbsp;but does not trash a ${CardView.render(copper)}`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but does not trash a ${CardView.render(new Copper())}`)
    }
  }

  static trash_copper(game, player_cards, response) {
    return response
  }

}
