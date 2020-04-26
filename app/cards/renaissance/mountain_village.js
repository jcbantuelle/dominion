MountainVillage = class MountainVillage extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(2)

    if (_.size(player_cards.discard) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to put in hand:',
        cards: player_cards.discard,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(MountainVillage.put_in_hand)
    } else if (_.size(player_cards.discard) === 1) {
      MountainVillage.put_in_hand(game, player_cards, player_cards.discard)
    } else {
      game.log.push(`&nbsp;&nbsp;but the discard pile is empty`)
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(1)
    }
  }

  static put_in_hand(game, player_cards, selected_cards) {
    let card_mover = new CardMover(game, player_cards)
    card_mover.move(player_cards.discard, player_cards.hand, selected_cards[0])
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts a card in hand from their discard`)
  }

}
