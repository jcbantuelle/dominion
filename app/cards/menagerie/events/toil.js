Toil = class Toil extends Event {

  coin_cost() {
    return 2
  }

  buy(game, player_cards) {
    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    let eligible_cards = _.filter(player_cards.hand, (card) => {
      return _.includes(_.words(card.types), 'action')
    })

    if (_.size(eligible_cards) > 0) {
      GameModel.update(game._id, game)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to play: (or none to skip)',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      let card_to_play = turn_event_processor.process(Toil.play_card)

      if (!_.isEmpty(card_to_play)) {
        let card_player = new CardPlayer(game, player_cards, card_to_play[0])
        card_player.play(true, true)
      } else {
        game.log.push(`&nbsp;&nbsp;but chooses not to play an action`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to play an action`)
    }
  }

  static play_card(game, player_cards, selected_cards) {
    return selected_cards
  }

}
