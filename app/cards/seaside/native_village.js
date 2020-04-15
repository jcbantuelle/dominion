NativeVillage = class NativeVillage extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(2)

    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: 'Choose One:',
      minimum: 1,
      maximum: 1,
      options: [
        {text: 'Set aside card', value: 'set_aside'},
        {text: 'Put cards in hand', value: 'gain'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(NativeVillage.process_response)
  }

  static process_response(game, player_cards, response) {
    response = response[0]
    if (response === 'set_aside') {
      NativeVillage.set_aside_card(game, player_cards)
    } else if (response === 'gain') {
      NativeVillage.put_cards_in_hand(game, player_cards)
    }
  }

  static set_aside_card(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses to set aside the top card of their deck, but has no cards`)
    } else {
      if (_.size(player_cards.deck) === 0) {
        DeckShuffler.shuffle(game, player_cards)
      }
      let card_mover = new CardMover(game, player_cards)
      card_mover.move(player_cards.deck, player_cards.native_village, player_cards.deck[0])
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside the top card of their deck`)
    }
  }

  static put_cards_in_hand(game, player_cards) {
    let card_mover = new CardMover(game, player_cards)
    card_mover.move_all(player_cards.native_village, player_cards.hand)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts all cards in hand`)
  }

}
