Miser = class Miser extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose One:`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: `Put a ${CardView.render(new Copper())} on your Tavern`, value: 'copper'},
        {text: `+$1 per ${CardView.render(new Copper())} on your Tavern`, value: 'coin'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card_player)
    turn_event_processor.process(Miser.process_response)
  }

  static process_response(game, player_cards, response, card_player) {
    if (response[0] === 'copper') {
      let copper = _.find(player_cards.hand, function(card) {
        return card.name === 'Copper'
      })
      if (copper) {
        let card_mover = new CardMover(game, player_cards)
        card_mover.move(player_cards.hand, player_cards.tavern, copper)
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(copper)} on their Tavern`)
      } else {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses to move a ${CardView.render(new Copper())}, but has none in hand`)
      }
    } else if (response[0] === 'coin') {
      let copper_count = _.size(_.filter(player_cards.tavern, function(card) {
        return card.name === 'Copper'
      }))
      let coin_gainer = new CoinGainer(game, player_cards, card_player)
      coin_gainer.gain(copper_count)
    }
  }

}
