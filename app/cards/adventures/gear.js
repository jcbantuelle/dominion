Gear = class Gear extends Duration {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)

    if (_.size(player_cards.hand) > 0) {
      let gear_effect = _.clone(card_player.card)
      if (_.size(player_cards.hand) > 1) {
        GameModel.update(game._id, game)
        PlayerCardsModel.update(game._id, player_cards)
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose up to 2 cards to set aside:',
          cards: player_cards.hand,
          minimum: 0,
          maximum: 2
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        gear_effect.gear_cards = turn_event_processor.process(Gear.choose_cards)
      } else {
        gear_effect.gear_cards = _.clone(player_cards.hand)
      }

      if (_.size(gear_effect.gear_cards) > 0) {
        _.each(gear_effect.gear_cards, (card) => {
          let card_mover = new CardMover(game, player_cards)
          card_mover.move(player_cards.hand, player_cards.gear, card)
        })
        let card_text = _.size(gear_effect.gear_cards) === 1 ? 'card' : 'cards'
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside ${_.size(gear_effect.gear_cards)} ${card_text}`)
        player_cards.duration_effects.push(gear_effect)
        return 'duration'
      } else {
        game.log.push(`&nbsp;&nbsp;but chooses not to set anything aside`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static choose_cards(game, player_cards, selected_cards) {
    return selected_cards
  }

  duration(game, player_cards, gear) {
    _.each(gear.gear_cards, (card) => {
      let card_mover = new CardMover(game, player_cards)
      card_mover.move(player_cards.gear, player_cards.hand, card)
    })
    let card_text = _.size(gear.gear_cards) === 1 ? 'card' : 'cards'
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${_.size(gear.gear_cards)} ${card_text} in hand from ${CardView.render(gear)}`)
  }

}
