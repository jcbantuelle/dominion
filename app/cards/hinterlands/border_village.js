BorderVillage = class BorderVillage extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 6
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(2)
  }

  gain_event(gainer, border_village) {
    let eligible_cards = _.filter(gainer.game.cards, function(card) {
      return card.count > 0 && card.supply && CardCostComparer.card_less_than(gainer.game, border_village, card.top_card)
    })
    if (_.size(eligible_cards) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: gainer.game._id,
        player_id: gainer.player_cards.player_id,
        username: gainer.player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: `Choose a card to gain:`,
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(gainer.game, gainer.player_cards, turn_event_id)
      turn_event_processor.process(BorderVillage.gain_card)
    } else if (_.size(eligible_cards) === 1) {
      BorderVillage.gain_card(gainer.game, gainer.player_cards, eligible_cards)
    } else {
      gainer.game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain()
  }

}
