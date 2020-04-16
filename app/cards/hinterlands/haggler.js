Haggler = class Haggler extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let gained_coins = CoinGainer.gain(game, player_cards, 2)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)
  }

  buy_event(buyer) {
    let eligible_cards = _.filter(buyer.game.cards, function(card) {
      return card.count > 0 && card.top_card.purchasable && !_.includes(_.words(card.top_card.types), 'victory') && CardCostComparer.card_less_than(buyer.game, buyer.card.to_h(), card.top_card)
    })
    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: buyer.game._id,
        player_id: buyer.player_cards.player_id,
        username: buyer.player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: `Choose a card to gain from ${CardView.render(this)}:`,
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(buyer.game, buyer.player_cards, turn_event_id)
      turn_event_processor.process(Haggler.gain_card)
    } else {
      buyer.game.log.push(`&nbsp;&nbsp;but there are no available cards to gain from ${CardView.render(this)}`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain()
  }

}
