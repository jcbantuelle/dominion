ScryingPool = class ScryingPool extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 2
  }

  potion_cost() {
    return 1
  }

  play(game, player_cards) {
    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    ScryingPool.reveal_card(game, player_cards)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)

    this.reveal(game, player_cards)

    player_cards.hand = player_cards.hand.concat(player_cards.revealed)
    player_cards.revealed = []
  }

  reveal(game, player_cards) {
    var non_action
    while((_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) && !non_action) {
      if (_.size(player_cards.deck) === 0) {
        DeckShuffler.shuffle(player_cards)
      }
      let card = player_cards.deck.shift()
      player_cards.revealed.push(card)
      if (!_.contains(_.words(card.types), 'action')) {
        non_action = true
      }
    }
    if (_.isEmpty(player_cards.revealed)) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in their deck`)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.revealed)} and puts the cards in their hand`)
    }
  }

  attack(game, player_cards) {
    ScryingPool.reveal_card(game, player_cards)
  }

  static reveal_card(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      if (_.size(player_cards.deck) === 0) {
        DeckShuffler.shuffle(player_cards)
      }

      let revealed_card = player_cards.deck.shift()
      player_cards.revealed.push(revealed_card)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(revealed_card)}`)

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: game.turn.player._id,
        username: game.turn.player.username,
        type: 'choose_yes_no',
        instructions: `Make <strong>${player_cards.username}</strong> discard ${CardView.render(revealed_card)}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Spy.discard_card)
    }
  }

  static discard_card(game, player_cards, response) {
    if (response === 'yes') {
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed', _.pluck(player_cards.revealed, 'name'))
      card_discarder.discard()
    } else {
      let card = player_cards.revealed[0]
      player_cards.deck.unshift(card)
      player_cards.revealed = []
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(card)} on top of deck`)
    }
  }

}
