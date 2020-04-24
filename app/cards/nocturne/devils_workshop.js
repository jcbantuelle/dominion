DevilsWorkshop = class DevilsWorkshop extends Card {

  types() {
    return ['night']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    if (_.size(game.turn.gained_cards) > 1) {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Imp')
      card_gainer.gain()
    } else if (_.size(game.turn.gained_cards) == 1) {
      let eligible_cards = _.filter(game.cards, function(card) {
        return card.count > 0 && card.supply && CardCostComparer.coin_less_than(game, card.top_card, 5)
      })

      if (_.size(eligible_cards) > 1) {
        let turn_event_id = TurnEventModel.insert({
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
        turn_event_processor.process(DevilsWorkshop.gain_card)
      } else if (_.size(eligible_cards) === 1) {
        DevilsWorkshop.gain_card(game, player_cards, eligible_cards)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
      }
    } else {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Gold')
      card_gainer.gain()
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain()
  }

}
