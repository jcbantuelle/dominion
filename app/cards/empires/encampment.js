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

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(2)

    GameModel.update(game._id, game)
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
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card_player.card)
      turn_event_processor.process(Encampment.reveal)
    } else {
      Encampment.set_aside(game, player_cards, card_player.card)
    }
  }

  start_cleanup_event(game, player_cards, encampment) {
    let card_mover = new CardMover(game, player_cards)
    card_mover.return_to_supply(player_cards.aside, encampment.stack_name, [encampment])
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> returns ${CardView.render(encampment)} to the Supply`)
  }

  static reveal(game, player_cards, selected_cards, encampment) {
    if (_.size(selected_cards) > 0) {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal('hand', selected_cards)
    } else {
      Encampment.set_aside(game, player_cards, encampment)
    }
  }

  static set_aside(game, player_cards, encampment) {
    game.log.push(`&nbsp;&nbsp;but does not reveal a Gold or Plunder`)
    let card_mover = new CardMover(game, player_cards)
    if (card_mover.move(player_cards.in_play, player_cards.aside, encampment)) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside ${CardView.render(encampment)}`)
    }
  }

}
