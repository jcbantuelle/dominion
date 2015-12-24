Scavenger = class Scavenger extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let gained_coins = CoinGainer.gain(game, player_cards, 2)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)

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

    if (_.size(player_cards.discard) > 0) {
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
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts their deck into their discard pile`)
      player_cards.discard = player_cards.discard.concat(player_cards.deck)
      player_cards.deck = []
    }
  }

  static put_on_deck(game, player_cards, selected_cards) {
    let discard_card_index = _.findIndex(player_cards.discard, function(card) {
      return card.name === selected_cards[0].name
    })

    player_cards.deck.unshift(player_cards.discard.splice(discard_card_index, 1)[0])
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts a card from their discard on top of their deck`)
  }

}
