WildHunt = class WildHunt extends Card {

  types() {
    return ['action', 'gathering']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose One:`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: '+3 cards', value: 'cards'},
        {text: 'Gain Estate', value: 'estate'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(WildHunt.process_response)
  }

  static process_response(game, player_cards, response) {
    let wild_hunt_index = _.findIndex(game.cards, (card) => {
      return card.name === 'Wild Hunt'
    })

    response = response[0]
    if (response === 'cards') {
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(3)

      if (wild_hunt_index != -1) {
        game.cards[wild_hunt_index].victory_tokens += 1
      } else {
        game.log.push(`&nbsp;&nbsp;but there is no ${CardView.render(this)} pile`)
      }
    } else if (response === 'estate') {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Estate')
      let gained = card_gainer.gain()
      if (gained) {
        if (wild_hunt_index != -1) {
          let victory_tokens = game.cards[wild_hunt_index].victory_tokens
          if (victory_tokens > 0) {
            game.cards[wild_hunt_index].victory_tokens = 0

            if (game.turn.possessed) {
              possessing_player_cards = PlayerCardsModel.findOne(game._id, game.turn.possessed._id)
              possessing_player_cards.victory_tokens += victory_tokens
              game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> gets +${victory_tokens} &nabla;`)
              PlayerCardsModel.update(game._id, possessing_player_cards)
            } else {
              player_cards.victory_tokens += victory_tokens
              game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +${victory_tokens} &nabla;`)
            }
          }
        } else {
          game.log.push(`&nbsp;&nbsp;but there is no ${CardView.render(this)} pile`)
        }
      } else {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses to gain an ${CardView.render(new Estate(game))} but there are none`)
      }
    }
  }

}
