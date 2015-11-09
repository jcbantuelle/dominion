Smugglers = class Smugglers extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let last_player_gained_card_names = _.uniq(_.map(game.turn.last_player_gained_cards, function(card) {
      return card.name
    }))
    let eligible_cards = _.filter(game.kingdom_cards.concat(game.common_cards), function(card) {
      return card.top_card.coin_cost <= 6 && card.top_card.potion_cost === 0 && _.contains(last_player_gained_card_names, card.top_card.name)
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEvents.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: 'Choose a card to gain:',
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Smugglers.gain_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    let card_gainer = new CardGainer(game, player_cards.username, player_cards.discard, selected_card.name)
    card_gainer[`gain_${selected_card.source}_card`]()
  }

}
