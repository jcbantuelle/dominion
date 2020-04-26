Haggler = class Haggler extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2)
  }

  buy_event(buyer, haggler) {
    let eligible_cards = _.filter(buyer.game.cards, function(card) {
      return card.count > 0 && card.supply && !_.includes(_.words(card.top_card.types), 'victory') && CardCostComparer.card_less_than(buyer.game, buyer.card, card.top_card)
    })
    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: buyer.game._id,
        player_id: buyer.player_cards.player_id,
        username: buyer.player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: `Choose a card to gain from ${CardView.render(haggler)}:`,
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(buyer.game, buyer.player_cards, turn_event_id)
      turn_event_processor.process(Haggler.gain_card)
    } else {
      buyer.game.log.push(`&nbsp;&nbsp;but there are no available cards to gain from ${CardView.render(haggler)}`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain()
  }

}
