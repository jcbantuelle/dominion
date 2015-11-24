Herbalist = class Herbalist extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    game.turn.buys += 1
    game.turn.coins += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy and +$1`)
  }

  discard_from_play(game, player_cards) {
    let treasures = _.filter(player_cards.in_play, function(card) {
      return _.contains(card.types, 'treasure')
    })
    let turn_event_id = TurnEvents.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_cards',
      player_cards: true,
      instructions: 'Choose a treasure to put on your deck (Or none to skip):',
      cards: treasures,
      minimum: 0,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(Herbalist.put_on_deck)
  }

  static put_on_deck(game, player_cards, selected_cards) {
    let card_index = _.findIndex(player_cards.in_play, function(card) {
      return card.name === selected_cards[0].name
    })

    let card = player_cards.in_play.splice(card_index, 1)[0]
    player_cards.deck.unshift(card)
    game.log.push(`<strong>${player_cards.username}</strong> puts ${CardView.render(card)} on top of their deck`)
  }

}
