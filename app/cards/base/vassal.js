Vassal = class Vassal extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let gained_coins = CoinGainer.gain(game, player_cards, 2)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)

    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      if (_.size(player_cards.deck) === 0) {
        DeckShuffler.shuffle(game, player_cards)
      }

      let revealed_card = player_cards.deck.shift()
      player_cards.revealed.push(revealed_card)

      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard()

      if (_.includes(_.words(revealed_card.types), 'action')) {
        GameModel.update(game._id, game)
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: game.turn.player._id,
          username: game.turn.player.username,
          type: 'choose_yes_no',
          instructions: `Play ${CardView.render(revealed_card)}?`,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, revealed_card)
        turn_event_processor.process(Vassal.play_card)
      }
    }
  }

  static play_card(game, player_cards, response, revealed_card) {
    if (response === 'yes') {
      let card_index = _.findIndex(player_cards.discard, function(card) {
        return card.name === revealed_card.name
      })
      player_cards.hand.push(player_cards.discard.splice(card_index, 1)[0])
      let card_player = new CardPlayer(game, player_cards, revealed_card.id, true)
      card_player.play()
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to play it`)
    }
  }

}
