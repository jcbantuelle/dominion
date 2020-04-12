Vassal = class Vassal extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2)

    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      if (_.size(player_cards.deck) === 0) {
        DeckShuffler.shuffle(game, player_cards)
      }
      let discarded_card = player_cards.deck[0]
      let card_discarder = new CardDiscarder(game, player_cards, 'deck', discarded_card)
      card_discarder.discard()

      if (_.includes(_.words(discarded_card.types), 'action')) {
        GameModel.update(game._id, game)
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: game.turn.player._id,
          username: game.turn.player.username,
          type: 'choose_yes_no',
          instructions: `Play ${CardView.render(discarded_card)}?`,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, discarded_card)
        turn_event_processor.process(Vassal.play_card)
      }
    }
  }

  static play_card(game, player_cards, response, discarded_card) {
    if (response === 'yes') {
      let card_player = new CardPlayer(game, player_cards, discarded_card)
      card_player.play(true, true, 'discard')
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to play it`)
    }
  }

}
