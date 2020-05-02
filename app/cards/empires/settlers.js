Settlers = class Settlers extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  stack_name() {
    return 'Settlers/Bustling Village'
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    let copper = _.find(player_cards.discard, function(card) {
      return card.name === 'Copper'
    })
    if (copper) {
      PlayerCardsModel.update(game._id, player_cards)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: `Reveal ${CardView.render(copper)}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, copper)
      turn_event_processor.process(Settlers.reveal_copper)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not reveal a ${CardView.render(new Copper())}`)
    }
  }

  static reveal_copper(game, player_cards, response, copper) {
    if (response === 'yes') {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal(copper)

      let card_mover = new CardMover(game, player_cards)
      card_mover.move(player_cards.discard, player_cards.hand, copper)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(copper)} in hand`)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not reveal a ${CardView.render(copper)}`)
    }
  }

}
