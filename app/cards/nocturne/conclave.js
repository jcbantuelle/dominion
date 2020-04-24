Conclave = class Conclave extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2)

    let in_play_card_names = _.map(player_cards.in_play, 'name')
    let eligible_cards = _.filter(player_cards.hand, (card) => {
      return _.includes(_.words(card.types), 'action') && !_.includes(in_play_card_names, card.name)
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose an action to play: (or none to skip)',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card_player.card)
      turn_event_processor.process(Conclave.play_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not play an action`)
    }
  }

  static play_card(game, player_cards, selected_cards, conclave) {
    if (!_.isEmpty(selected_cards)) {
      let card_player = new CardPlayer(game, player_cards, selected_cards[0], conclave)
      card_player.play(true)

      let action_gainer = new ActionGainer(game, player_cards)
      action_gainer.gain(1)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not play an action`)
    }
  }

}
