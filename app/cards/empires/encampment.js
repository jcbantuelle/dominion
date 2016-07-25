Encampment = class Encampment extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  stack_name() {
    return 'Encampment/Plunder'
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)

    game.turn.actions += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions`)

    PlayerCardsModel.update(game._id, player_cards)

    let gold_and_plunder = _.filter(player_cards.hand, function(card) {
      return card.name === 'Gold' || card.name === 'Plunder'
    })

    if (_.size(gold_and_plunder) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a Plunder or Gold to reveal (or none to skip):',
        cards: gold_and_plunder,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Encampment.reveal)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not reveal a Gold or Plunder`)
      Encampment.set_aside(game, player_cards)
    }
  }

  static reveal(game, player_cards, selected_cards) {
    if (_.size(selected_cards) > 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(selected_cards)}`)
    } else {
      Encampment.set_aside(game, player_cards)
    }
  }

  static set_aside(game, player_cards) {
    let encampment_index = _.findIndex(player_cards.playing, function(card) {
      return card.inherited_name === 'Encampment'
    })
    if (encampment_index !== -1) {
      let encampment = player_cards.playing.splice(encampment_index, 1)[0]
      player_cards.encampments.push(encampment)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside ${CardView.render(encampment)}`)
    }
  }

}
