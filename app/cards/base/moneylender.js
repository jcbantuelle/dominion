Moneylender = class Moneylender extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let has_copper = _.some(player_cards.hand, function(card) {
      return card.name === 'Copper'
    })

    if (has_copper) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: game.turn.player._id,
        username: game.turn.player.username,
        type: 'choose_yes_no',
        instructions: `Trash a ${CardView.card_html('treasure', 'Copper')}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Moneylender.trash_copper)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not trash a ${CardView.card_html('treasure', 'Copper')}`)
    }
  }

  static trash_copper(game, player_cards, response) {
    if (response === 'yes') {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', 'Copper')
      card_trasher.trash()
      let gained_coins = CoinGainer.gain(game, player_cards, 3)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not trash a ${CardView.card_html('treasure', 'Copper')}`)
    }
  }

}
