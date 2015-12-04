Ironmonger = class Ironmonger extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    this.reveal(game, player_cards)

    let gains = []
    let types = _.words(player_cards.revealed_card.types)
    if (_.contains(types, 'action')) {
      game.turn.actions += 1
      gains.push('+1 action')
    }
    if (_.contains(types, 'treasure')) {
      game.turn.coins += 1
      gains.push('+$1')
    }
    if (_.contains(types, 'victory')) {
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(1)
    }
    if (!_.isEmpty(gains)) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets ${gains.join(' and ')}`)
    }

    delete player_cards.revealed_card
  }

  reveal(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      if (_.size(player_cards.deck) === 0) {
        DeckShuffler.shuffle(player_cards)
      }

      player_cards.revealed_card = player_cards.deck.shift()
      player_cards.revealed.push(player_cards.revealed_card)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.revealed_card)}`)

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: game.turn.player._id,
        username: game.turn.player.username,
        type: 'choose_yes_no',
        instructions: `Discard ${CardView.render(player_cards.revealed_card)}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Ironmonger.discard_card)
    }
  }

  static discard_card(game, player_cards, response) {
    if (response === 'yes') {
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard_all()
    } else {
      player_cards.deck.unshift(player_cards.revealed_card)
      game.log.push(`&nbsp;&nbsp;and puts it back on top of their deck`)
    }
  }

}
