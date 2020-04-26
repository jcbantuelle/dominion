Innovation = class Innovation extends Project {

  coin_cost() {
    return 6
  }

  gain_event(gainer, innovation) {
    gainer.game.log.push(`<strong>${gainer.player_cards.username}</strong> resolves ${CardView.render(innovation)}`)

    let turn_event_id = TurnEventModel.insert({
      game_id: gainer.game._id,
      player_id: gainer.player_cards.player_id,
      username: gainer.player_cards.username,
      type: 'choose_yes_no',
      instructions: `Set ${CardView.render(gainer.gained_card)} aside?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(gainer.game, gainer.player_cards, turn_event_id)
    let choice = turn_event_processor.process(Innovation.set_aside)

    if (choice === 'yes') {
      let card_mover = new CardMover(gainer.game, gainer.player_cards)
      if (card_mover.move(gainer.player_cards[gainer.destination], gainer.player_cards.aside, gainer.gained_card)) {
        gainer.game.log.push(`&nbsp;&nbsp;<strong>${gainer.player_cards.username}</strong> sets aside ${CardView.render(gainer.gained_card)}`)
        let card_player = new CardPlayer(gainer.game, gainer.player_cards, gainer.gained_card)
        card_player.play(true, true, 'aside')
      }
    } else {
      gainer.game.log.push(`&nbsp;&nbsp;but chooses not to set aside ${CardView.render(gainer.gained_card)}`)
    }
  }

  static set_aside(game, player_cards, response) {
    return response
  }

}
