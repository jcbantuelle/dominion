Jester = class Jester extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    game.turn.coins += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$2`)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)
  }

  attack(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      if (_.size(player_cards.deck) === 0) {
        DeckShuffler.shuffle(game, player_cards)
      }
      player_cards.revealed_card = player_cards.deck.shift()
      player_cards.revealed.push(player_cards.revealed_card)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> discards ${CardView.render(player_cards.revealed)} from the top of their deck`)
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard(false)

      if (_.contains(_.words(player_cards.revealed_card.types), 'victory')) {
        let card_gainer = new CardGainer(game, player_cards, 'discard', 'Curse')
        card_gainer.gain_game_card()
      } else {
        GameModel.update(game._id, game)
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: game.turn.player._id,
          username: game.turn.player.username,
          type: 'choose_options',
          instructions: `Choose who should gain a copy of ${CardView.render(player_cards.revealed_card)}:`,
          minimum: 1,
          maximum: 1,
          options: [
            {text: `${game.turn.player.username}`, value: 'self'},
            {text: `${player_cards.username}`, value: 'opponent'}
          ]
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Jester.process_response)
      }

      delete player_cards.revealed_card
    }

  }

  static process_response(game, player_cards, response) {
    response = response[0]
    var gainer_cards
    if (response === 'self') {
      gainer_cards = PlayerCardsModel.findOne(game._id, game.turn.player._id)
    } else if (response === 'opponent') {
      gainer_cards = player_cards
    }

    let card_gainer = new CardGainer(game, gainer_cards, 'discard', player_cards.revealed_card.name)
    card_gainer.gain_game_card()
  }

}
