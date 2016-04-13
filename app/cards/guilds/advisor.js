Advisor = class Advisor extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    if (_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) {
      player_cards.revealed = _.take(player_cards.deck, 3)
      player_cards.deck = _.drop(player_cards.deck, 3)

      let revealed_card_count = _.size(player_cards.revealed)
      if (revealed_card_count < 3 && _.size(player_cards.discard) > 0) {
        DeckShuffler.shuffle(game, player_cards)
        player_cards.revealed = player_cards.revealed.concat(_.take(player_cards.deck, 3 - revealed_card_count))
        player_cards.deck = _.drop(player_cards.deck, 3 - revealed_card_count)
      }

      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.revealed)}`)
      GameModel.update(game._id, game)

      let next_player_query = new NextPlayerQuery(game, player_cards.player_id)
      let next_player = next_player_query.next_player()
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: next_player._id,
        username: next_player.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose a card for <strong>${player_cards.username}</strong> to discard:`,
        cards: player_cards.revealed,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Advisor.discard_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in deck to reveal`)
    }
  }

  static discard_cards(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'revealed', _.map(selected_cards, 'name'))
    card_discarder.discard()

    player_cards.hand = player_cards.hand.concat(player_cards.revealed)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(player_cards.revealed)} in their hand`)

    player_cards.revealed = []
  }

}
