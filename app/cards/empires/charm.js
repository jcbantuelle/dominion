Charm = class Charm extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose One:`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: '+$2 and +1 buy', value: 'coin'},
        {text: 'Gain a card on next buy', value: 'gain'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(Charm.process_response)
  }

  static process_response(game, player_cards, response) {
    if (response[0] === 'coin') {
      let buy_gainer = new BuyGainer(game, player_cards)
      buy_gainer.gain(1)

      let coin_gainer = new CoinGainer(game, player_cards)
      coin_gainer.gain(2)
    } else if (response[0] === 'gain') {
      game.turn.charms += 1
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses to gain a card on next buy`)
    }
  }

  buy_event(buyer, charm) {
    buyer.game.turn.charms -= 1
    let eligible_cards = _.filter(buyer.game.cards, (card) => {
      return card.count > 0 && card.supply && card.top_card.name != buyer.card.name && CardCostComparer.card_equal_to(buyer.game, card.top_card, buyer.card)
    })
    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: buyer.game._id,
        player_id: buyer.player_cards.player_id,
        username: buyer.player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: 'Choose a card to gain (or none to skip):',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(buyer.game, buyer.player_cards, turn_event_id, charm)
      turn_event_processor.process(Charm.gain_card)
    } else {
      buyer.game.log.push(`&nbsp;&nbsp;but there are no available cards to gain from ${CardView.render(charm)}`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    if (_.size(selected_cards) > 0) {
      let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
      card_gainer.gain()
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses not to gain a card from ${CardView.render(charm)}`)
    }
  }

}
