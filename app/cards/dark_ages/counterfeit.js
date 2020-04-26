Counterfeit = class Counterfeit extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(1, false)

    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    let eligible_cards = _.filter(player_cards.hand, function(card) {
      return _.includes(_.words(card.types), 'treasure')
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a treasure to play two times: (or none to skip)',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card_player.card)
      turn_event_processor.process(Counterfeit.play_twice)
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to play a treasure`)
    }
  }

  static play_twice(game, player_cards, selected_cards, counterfeit) {
    if (!_.isEmpty(selected_cards)) {
      let card_player = new CardPlayer(game, player_cards, selected_cards[0], counterfeit)
      card_player.play(true, true, 'hand', 2)

      let card_trasher = new CardTrasher(game, player_cards, 'in_play', selected_cards)
      card_trasher.trash()
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to play a treasure`)
    }
  }

}
