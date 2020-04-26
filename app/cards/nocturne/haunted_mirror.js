HauntedMirror = class HauntedMirror extends Card {

  types() {
    return ['treasure', 'heirloom']
  }

  coin_cost() {
    return 0
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(1, false)
  }

  trash_event(trasher, haunted_mirror) {
    let eligible_cards = _.filter(trasher.player_cards.hand, function(card) {
      return _.includes(_.words(card.types), 'action')
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: trasher.game._id,
        player_id: trasher.player_cards.player_id,
        username: trasher.player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose an action to discard for ${CardView.render(haunted_mirror)}: (or none to skip)`,
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(trasher.game, trasher.player_cards, turn_event_id)
      turn_event_processor.process(HauntedMirror.gain_card)
    } else {
      trasher.game.log.push(`&nbsp;&nbsp;but chooses not to discard an action`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    if (_.size(selected_cards) > 0) {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
      card_discarder.discard()

      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Ghost')
      card_gainer.gain()
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to discard an action`)
    }
  }

}
