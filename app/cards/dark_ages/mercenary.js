Mercenary = class Mercenary extends Card {

  types() {
    return this.capitalism_types(['action', 'attack'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 0
  }

  play(game, player_cards) {
    if (_.size(player_cards.hand) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: 'Trash 2 Cards?',
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Mercenary.choose_trash)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in hand`)
    }

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)

    delete game.turn.mercenary_attack
  }

  attack(game, player_cards) {
    if (game.turn.mercenary_attack) {
      let number_to_discard = _.size(player_cards.hand) - 3

      if (number_to_discard > 0) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: `Choose ${number_to_discard} cards to discard from hand:`,
          cards: player_cards.hand,
          minimum: number_to_discard,
          maximum: number_to_discard
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Mercenary.discard_from_hand)
      } else {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> only has ${_.size(player_cards.hand)} cards in hand`)
      }
    }
  }

  static discard_from_hand(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
    card_discarder.discard()
  }

  static choose_trash(game, player_cards, response) {
    if (response === 'yes') {
      if (_.size(player_cards.hand) > 2) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose 2 cards to trash:',
          cards: player_cards.hand,
          minimum: 2,
          maximum: 2
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Mercenary.trash_cards)
      } else {
        Mercenary.trash_cards(game, player_cards, player_cards.hand)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to trash`)
    }
  }

  static trash_cards(game, player_cards, selected_cards) {
    let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
    let trashed_card_count = _.size(card_trasher.trash())

    if (trashed_card_count === 2) {
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(2)

      let coin_gainer = new CoinGainer(game, player_cards)
      coin_gainer.gain(2)

      game.turn.mercenary_attack = true
    } else {
      game.log.push(`&nbsp;&nbsp;but did not trash enough to continue`)
    }
  }

}
