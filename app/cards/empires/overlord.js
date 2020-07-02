Overlord = class Overlord extends Card {

  types() {
    return ['action', 'command']
  }

  coin_cost() {
    return 0
  }

  debt_cost() {
    return 8
  }

  play(game, player_cards, card_player) {
    let eligible_cards = _.filter(game.cards, function(card) {
      return card.count > 0 && card.supply && _.includes(_.words(card.top_card.types), 'action') && !_.includes(_.words(card.top_card.types), 'command') && CardCostComparer.coin_less_than(game, card.top_card, 6)
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
      turn_event_processor.process(Overlord.play_card)
    } else if (_.size(eligible_cards) === 1) {
      Overlord.play_card(game, player_cards, eligible_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to play`)
    }
  }

  static play_card(game, player_cards, selected_cards, overlord) {
    let card_player = new CardPlayer(game, player_cards, selected_cards[0], overlord)
    card_player.play(true, false)
  }

}
