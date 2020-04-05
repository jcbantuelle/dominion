Miser = class Miser extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
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
        {text: `Put a ${CardView.render(new Copper())} on your Tavern`, value: 'copper'},
        {text: `+$1 per ${CardView.render(new Copper())} on your Tavern`, value: 'coin'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(Miser.process_response)
  }

  static process_response(game, player_cards, response) {
    response = response[0]
    if (response === 'copper') {
      let copper_index = _.findIndex(player_cards.hand, function(card) {
        return card.name === 'Copper'
      })
      if (copper_index !== -1) {
        let copper = player_cards.hand.splice(copper_index, 1)[0]
        player_cards.tavern.push(copper)
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(copper)} on their Tavern`)
      } else {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses to move a copper, but has none in hand`)
      }
    } else if (response === 'coin') {
      let copper_count = _.size(_.filter(player_cards.tavern, function(card) {
        return card.name === 'Copper'
      }))
      let gained_coins = CoinGainer.gain(game, player_cards, copper_count)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)
    }
  }

}
