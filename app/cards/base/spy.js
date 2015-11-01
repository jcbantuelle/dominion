Spy = class Spy extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    Games.update(game._id, game)
    PlayerCards.update(player_cards._id, player_cards)

    return Spy.reveal_card(game, player_cards)
  }

  attack(game, player) {
    let player_cards = PlayerCards.findOne({
      player_id: player._id,
      game_id: game._id
    })

    return Spy.reveal_card(game, player_cards)
  }

  static reveal_card(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong>has no cards in deck`)
      Games.update(game._id, game)
    } else {
      if (_.size(player_cards.deck) === 0) {
        let deck_shuffler = new DeckShuffler(player_cards)
        deck_shuffler.shuffle()
      }

      let revealed_card = player_cards.deck.shift()
      player_cards.revealed.push(revealed_card)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals <span class="${revealed_card.types}">${revealed_card.name}</span>`)
      Games.update(game._id, game)

      let turn_event_id = TurnEvents.insert({
        game_id: game._id,
        player_id: game.turn.player._id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: `Make <strong>${player_cards.username}</strong> discard <span class="${revealed_card.types}">${revealed_card.name}</span>?`,
        minimum: 1,
        maximum: 1,
        finished: false
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      return turn_event_processor.process(Spy.discard_card)
    }
  }

  static discard_card(game, player_cards, response) {
    if (response === 'yes') {
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard_all(true)
    } else {
      let card = player_cards.revealed[0]
      player_cards.deck.unshift(card)
      player_cards.revealed = []
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts <span class="${card.types}">${card.name}</span> on top of deck`)
    }
    Games.update(game._id, game)
    PlayerCards.update(player_cards._id, player_cards)
  }

}
