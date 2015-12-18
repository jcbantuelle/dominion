Gear = class Gear extends Card {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)

    PlayerCardsModel.update(game._id, player_cards)

    if (_.size(player_cards.hand) > 0) {
      let gear_effect = this.to_h()
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
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, gear_effect)
      turn_event_processor.process(Gear.set_aside_cards)

      if (_.size(gear_effect.set_aside_cards) > 0) {
        player_cards.duration_effects.push(gear_effect)
        player_cards.gear = player_cards.gear.concat(gear_effect.set_aside_cards)
        return 'duration'
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static set_aside_cards(game, player_cards, selected_cards, gear_effect) {
    gear_effect.set_aside_cards = []

    _.each(selected_cards, function(selected_card) {
      let card_index = _.findIndex(player_cards.hand, function(card) {
        return selected_card.name === card.name
      })
      gear_effect.set_aside_cards.push(player_cards.hand.splice(card_index, 1)[0])
    })

    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside ${_.size(gear_effect.set_aside_cards)} card(s)`)
  }

  duration(game, player_cards, duration_card) {
    _.each(duration_card.set_aside_cards, function(set_aside_card) {
      let set_aside_card_index = _.findIndex(player_cards.gear, function(card) {
        return set_aside_card.name === card.name
      })
      player_cards.hand.push(player_cards.gear.splice(set_aside_card_index, 1)[0])
    })

    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts their set aside cards in hand from ${CardView.render(duration_card)}`)
  }

}
