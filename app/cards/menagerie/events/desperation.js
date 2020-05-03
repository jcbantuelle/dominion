Desperation = class Desperation extends Event {

  coin_cost() {
    return 0
  }

  buy(game, player_cards) {
    game.turn.forbidden_events.push(this.name())

    let curse = _.find(game.cards, (card) => {
      return card.name === 'Curse' && card.count > 0
    })
    if (curse) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: `Gain ${CardView.render(curse)}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      let response = turn_event_processor.process(Desperation.gain_curse)

      if (response === 'yes') {
        let card_gainer = new CardGainer(game, player_cards, 'discard', 'Curse')
        card_gainer.gain()

        let buy_gainer = new BuyGainer(game, player_cards)
        buy_gainer.gain(1)

        let coin_gainer = new CoinGainer(game, player_cards)
        coin_gainer.gain(2)
      } else {
        game.log.push(`&nbsp;&nbsp;but chooses not to gain a ${CardView.render(curse)}`)  
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but there is no ${CardView.render(new Curse())} to gain`)
    }
  }

  static gain_curse(game, player_cards, response) {
    return response
  }
}
