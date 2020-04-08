Ducat = class Ducat extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    game.turn.buys += 1
    if (game.turn.possessed) {
      possessing_player_cards = PlayerCardsModel.findOne(game._id, game.turn.possessed._id)
      possessing_player_cards.coin_tokens += 1
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy and <strong>${possessing_player_cards.username}</strong> takes a coin token`)
      PlayerCardsModel.update(game._id, possessing_player_cards)
    } else {
      player_cards.coin_tokens += 1
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy and takes a coin token`)
    }
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
        instructions: `Trash a ${CardView.render(new Copper())}?`,
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
