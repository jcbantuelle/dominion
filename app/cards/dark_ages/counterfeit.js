Counterfeit = class Counterfeit extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    CoinGainer.gain(game, player_cards, 1)
    game.turn.buys += 1

    let eligible_cards = _.filter(player_cards.hand, function(card) {
      return _.contains(_.words(card.types), 'treasure')
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a treasure to play two times: (Or none to skip)',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Counterfeit.play_twice)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no treasures in hand`)
    }
  }

  static play_twice(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let selected_card = selected_cards[0]

      let repeat_card_player = new RepeatCardPlayer(game, player_cards, selected_card.name)
      repeat_card_player.play(2, 'Counterfeit')

      let played_card_index = _.findIndex(player_cards.playing, function(card) {
        return card.name == repeat_card_player.card.name()
      })
      if (played_card_index !== -1) {
        let card_trasher = new CardTrasher(game, player_cards, 'playing', repeat_card_player.card.name())
        card_trasher.trash()
      }
    }
  }

}
