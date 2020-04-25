Ducat = class Ducat extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    let coffer_gainer = new CofferGainer(game, player_cards)
    coffer_gainer.gain(1)

    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)
  }

  gain_event(gainer) {
    let copper = _.find(gainer.player_cards.hand, function (card) {
      return card.name === 'Copper'
    })

    if (copper) {
      let turn_event_id = TurnEventModel.insert({
        game_id: gainer.game._id,
        player_id: gainer.player_cards.player_id,
        username: gainer.player_cards.username,
        type: 'choose_yes_no',
        instructions: `Trash a ${CardView.render(copper)}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(gainer.game, gainer.player_cards, turn_event_id, copper)
      turn_event_processor.process(Ducat.trash_copper)
    } else {
      gainer.game.log.push(`&nbsp;&nbsp;but does not trash a ${CardView.render(new Copper())}`)
    }
  }

  static trash_copper(game, player_cards, response, copper) {
    if (response === 'yes') {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', copper)
      card_trasher.trash()
    } else {
      game.log.push(`&nbsp;&nbsp;but does not trash a ${CardView.render(copper)}`)
    }
  }

}
