Catapult = class Catapult extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 3
  }

  stack_name() {
    return 'Catapult/Rocks'
  }

  play(game, player_cards) {
    let gained_coins = CoinGainer.gain(game, player_cards, 1)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)

    if (_.size(player_cards.hand) > 0) {
      PlayerCardsModel.update(game._id, player_cards)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to trash:',
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Catapult.trash_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)

    delete game.turn.catapult_trash
  }

  static trash_card(game, player_cards, selected_cards) {
    let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
    card_trasher.trash()

    game.turn.catapult_trash = selected_cards[0]
  }

  attack(game, player_cards) {
    if (game.turn.catapult_trash) {

      if (CardCostComparer.coin_greater_than(game, game.turn.catapult_trash, 2)) {
        let card_gainer = new CardGainer(game, player_cards, 'discard', 'Curse')
        card_gainer.gain()
      }

      if (_.includes(_.words(game.turn.catapult_trash.types), 'treasure')) {
        let number_to_discard = _.size(player_cards.hand) - 3

        if (number_to_discard > 0) {
          let turn_event_id = TurnEventModel.insert({
            game_id: game._id,
            player_id: player_cards.player_id,
            username: player_cards.username,
            type: 'choose_cards',
            player_cards: true,
            instructions: `Choose ${number_to_discard} card(s) to discard from hand:`,
            cards: player_cards.hand,
            minimum: number_to_discard,
            maximum: number_to_discard
          })
          let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
          turn_event_processor.process(Catapult.discard_from_hand)
        } else {
          game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> only has ${_.size(player_cards.hand)} cards in hand`)
        }
      }
    }
  }

  static discard_from_hand(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
    card_discarder.discard()
  }

}
