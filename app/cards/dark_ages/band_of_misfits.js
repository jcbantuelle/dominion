BandOfMisfits = class BandOfMisfits extends Card {

  types() {
    return ['action', 'command']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let eligible_cards = _.filter(game.cards, (card) => {
      return card.count > 0 && card.supply && _.includes(_.words(card.top_card.types), 'action') && !_.includes(_.words(card.top_card.types), 'command') && CardCostComparer.card_less_than(game, card_player.card, card.top_card)
    })
    eligible_cards = _.map(eligible_cards, (card) => {
      return _.clone(card.top_card)
    })

    if (_.size(eligible_cards) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        instructions: `Choose a card to play:`,
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card_player.card)
      turn_event_processor.process(BandOfMisfits.play_card)
    } else if (_.size(eligible_cards) === 1) {
      BandOfMisfits.play_card(game, player_cards, eligible_cards, card_player.card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to play`)
    }
  }

  static play_card(game, player_cards, selected_cards, band_of_misfits) {
    let card_player = new CardPlayer(game, player_cards, selected_cards[0], band_of_misfits)
    card_player.play(true, false)
  }

}
