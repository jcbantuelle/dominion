Oracle = class Oracle extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards, card_player) {
    Oracle.reveal_cards(game, player_cards)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)

    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(2)
  }

  attack(game, player_cards) {
    Oracle.reveal_cards(game, player_cards)
  }

  static reveal_cards(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(2)

      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: game.turn.player._id,
        username: game.turn.player.username,
        type: 'choose_yes_no',
        instructions: `Make <strong>${player_cards.username}</strong> discard ${CardView.render(player_cards.revealed)}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Oracle.discard_or_replace)
    }
    GameModel.update(game._id, game)
    PlayerCardsModel.update(game._id, player_cards)
  }

  static discard_or_replace(game, player_cards, response) {
    if (response === 'yes') {
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard()
    } else {
      let card_returner = new CardReturner(game, player_cards)
      card_returner.return_to_deck(player_cards.revealed)
    }
  }

}
