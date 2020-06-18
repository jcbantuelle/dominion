Gamble = class Gamble extends Event {

  coin_cost() {
    return 2
  }

  buy(game, player_cards) {
    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(1)

      let choice = 'no'
      if (_.includes(_.words(player_cards.revealed[0].types), 'action') || _.includes(_.words(player_cards.revealed[0].types), 'treasure')) {
        GameModel.update(game._id, game)
        PlayerCardsModel.update(game._id, player_cards)
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: game.turn.player._id,
          username: game.turn.player.username,
          type: 'choose_yes_no',
          instructions: `Play ${CardView.render(player_cards.revealed)}?`,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        choice = turn_event_processor.process(Gamble.play_card)
      }

      if (choice === 'yes') {
        let card_player = new CardPlayer(game, player_cards, player_cards.revealed[0])
        card_player.play(true, true, 'revealed')
      } else {
        let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
        card_discarder.discard()
      }
    }
  }

  static play_card(game, player_cards, response) {
    return response
  }

}
