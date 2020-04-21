Druid = class Druid extends Card {

  types() {
    return ['action', 'fate']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    game.turn.buys += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy`)

    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_cards',
      player_cards: true,
      instructions: 'Choose a boon to receive:',
      cards: game.druid_boons,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    return turn_event_processor.process(Druid.receive_boon)
  }

  static receive_boon(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> receives ${CardView.render(selected_card)}`)
    boon = ClassCreator.create(selected_card.name)
    boon.receive(game, player_cards)
  }

}
