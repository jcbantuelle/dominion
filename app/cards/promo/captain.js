Captain = class Captain extends Duration {

  types() {
    return ['action', 'duration', 'command']
  }

  coin_cost() {
    return 6
  }

  play(game, player_cards, card_player) {
    this.choose_action(game, player_cards, card_player.card)
    player_cards.duration_effects.push(_.clone(card_player.card))
    return 'duration'
  }

  duration(game, player_cards, captain) {
    this.choose_action(game, player_cards, captain)
  }

  choose_action(game, player_cards, captain) {
    let eligible_cards = _.filter(game.cards, (card) => {
      return card.count > 0 && card.supply && _.includes(_.words(card.top_card.types), 'action') && !_.includes(_.words(card.top_card.types), 'command') && !_.includes(_.words(card.top_card.types), 'duration') && CardCostComparer.coin_less_than(game, card.top_card, 5)
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
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, captain)
      turn_event_processor.process(Captain.play_card)
    } else if (_.size(eligible_cards) === 1) {
      Captain.play_card(game, player_cards, eligible_cards, captain)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to copy`)
    }
  }

  static play_card(game, player_cards, selected_cards, captain) {
    let card_player = new CardPlayer(game, player_cards, selected_cards[0], captain)
    card_player.play(true, false)
  }

}
