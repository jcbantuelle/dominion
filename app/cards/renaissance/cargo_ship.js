CargoShip = class CargoShip extends Duration {

  types() {
    return this.capitalism_types(['action', 'duration'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards, card_player) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2)

    game.turn.cargo_ships.push(_.clone(card_player.card))

    return 'duration'
  }

  gain_event(gainer, cargo_ship) {
    GameModel.update(gainer.game._id, gainer.game)
    let turn_event_id = TurnEventModel.insert({
      game_id: gainer.game._id,
      player_id: gainer.player_cards.player_id,
      username: gainer.player_cards.username,
      type: 'choose_yes_no',
      instructions: `Set ${CardView.render(gainer.gained_card)} aside on ${CardView.render(cargo_ship)}?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(gainer.game, gainer.player_cards, turn_event_id)
    let response = turn_event_processor.process(CargoShip.set_aside)

    if (response === 'yes') {
      let card_mover = new CardMover(gainer.game, gainer.player_cards)
      if (card_mover.move(gainer.player_cards[gainer.destination], gainer.player_cards.cargo_ship, gainer.gained_card)) {
        gainer.game.log.push(`&nbsp;&nbsp;<strong>${gainer.player_cards.username}</strong> sets ${CardView.render(gainer.gained_card)} aside on ${CardView.render(cargo_ship)}`)
        let cargo_ship_effect = cargo_ship
        cargo_ship_effect.cargo_ship_card = _.clone(gainer.gained_card)
        gainer.player_cards.duration_effects.push(cargo_ship_effect)
      }
      let cargo_ship_index = _.findIndex(gainer.game.turn.cargo_ships, (ship) => {
        return ship.id === cargo_ship.id
      })
      gainer.game.turn.cargo_ships.splice(cargo_ship_index, 1)
    }
  }

  static set_aside(game, player_cards, response) {
    return response
  }

  duration(game, player_cards, cargo_ship) {
    let card_mover = new CardMover(game, player_cards)
    card_mover.move(player_cards.cargo_ship, player_cards.hand, cargo_ship.cargo_ship_card)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(cargo_ship.cargo_ship_card)} in hand from ${CardView.render(cargo_ship)}`)
  }

}
