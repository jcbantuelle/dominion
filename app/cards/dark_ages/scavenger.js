Scavenger = class Scavenger extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let coin_gainer = new CoinGainer(game, player_cards, card_player)
    coin_gainer.gain(2)

    if (_.size(player_cards.deck) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: 'Put Deck In Discard?',
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Scavenger.discard_deck)
    } else {
      game.log.push(`&nbsp;&nbsp;but the deck is empty`)
    }

    if (_.size(player_cards.discard) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to put on top of your deck:',
        cards: player_cards.discard,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Scavenger.put_on_deck)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in the discard`)
    }
  }

  static discard_deck(game, player_cards, response) {
    if (response === 'yes') {
      let card_mover = new CardMover(game, player_cards)
      card_mover.move_all(player_cards.deck, player_cards.discard)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts their deck into their discard pile`)
    }
  }

  static put_on_deck(game, player_cards, selected_cards) {
    let card_mover = new CardMover(game, player_cards)
    card_mover.move(player_cards.discard, player_cards.deck, selected_cards[0])
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts a card from their discard on top of their deck`)
  }

}
