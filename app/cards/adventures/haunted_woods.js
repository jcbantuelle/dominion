HauntedWoods = class HauntedWoods extends Card {

  types() {
    return ['action', 'duration', 'attack']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    player_cards.duration_effects.push(this.to_h())

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)

    return 'duration'
  }

  attack(game, player_cards) {
    let attack_card = this.to_h()
    attack_card.player_source = game.turn.player
    player_cards.duration_attacks.push(attack_card)
  }

  duration(game, player_cards, duration_card) {
    let card_drawer = new CardDrawer(game, player_cards)
    let drawn_count = card_drawer.draw(3, false)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> draws ${drawn_count} cards from ${CardView.render(duration_card)}`)
  }

  buy_event(buyer) {
    if (_.size(buyer.player_cards.hand) === 0) {
      buyer.game.log.push(`&nbsp;&nbsp;<strong>${buyer.player_cards.username}</strong> has no cards in hand for ${CardView.render(this)}`)
    } else if (_.size(buyer.player_cards.hand) === 1) {
      HauntedWoods.replace_cards(buyer.game, buyer.player_cards, _.pluck(buyer.player_cards.hand, 'name'))
    } else {
      let turn_event_id = TurnEventModel.insert({
        game_id: buyer.game._id,
        player_id: buyer.player_cards.player_id,
        username: buyer.player_cards.username,
        type: 'sort_cards',
        instructions: 'Choose order to place hand on deck: (leftmost will be top card)',
        cards: buyer.player_cards.hand
      })
      let turn_event_processor = new TurnEventProcessor(buyer.game, buyer.player_cards, turn_event_id)
      turn_event_processor.process(HauntedWoods.replace_cards)
    }
  }

  static replace_cards(game, player_cards, ordered_card_names) {
    _.each(ordered_card_names.reverse(), function(card_name) {
      let hand_card_index = _.findIndex(player_cards.hand, function(card) {
        return card.name === card_name
      })
      let hand_card = player_cards.hand.splice(hand_card_index, 1)[0]
      player_cards.deck.unshift(hand_card)
    })
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places their hand on top of their deck from ${CardView.card_html('action attack duration', 'Haunted Woods')}`)
  }

}
