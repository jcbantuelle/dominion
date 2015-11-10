Thief = class Thief extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
  }

  attack(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      if (_.size(player_cards.deck) < 2 && _.size(player_cards.discard) > 0) {
        let deck_shuffler = new DeckShuffler(player_cards)
        deck_shuffler.shuffle()
      }
      player_cards.revealed = _.take(player_cards.deck, 2)
      player_cards.deck = _.drop(player_cards.deck, 2)

      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.revealed)}`)

      let revealed_treasures = _.filter(player_cards.revealed, function(card) {
        return _.contains(card.types, 'treasure')
      })
      if (_.isEmpty(revealed_treasures)) {
        game.log.push(`&nbsp;&nbsp;but there are no treasures to trash`)
        let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
        card_discarder.discard_all()
      } else if (_.size(revealed_treasures) === 1) {
        return Thief.trash_treasure(game, player_cards, revealed_treasures[0])
      } else {
        let turn_event_id = TurnEvents.insert({
          game_id: game._id,
          player_id: game.turn.player._id,
          username: game.turn.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: `Choose one of <strong>${player_cards.username}'s</strong> treasures to trash:`,
          cards: revealed_treasures,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Thief.choose_trashed_treasure)
      }
    }
  }

  static choose_trashed_treasure(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    return Thief.trash_treasure(game, player_cards, selected_card)
  }

  static trash_treasure(game, player_cards, trashed_treasure) {
    game.turn.trashed_treasure = trashed_treasure
    let card_trasher = new CardTrasher(game, player_cards.username, player_cards.revealed, trashed_treasure.name)
    card_trasher.trash()

    let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
    card_discarder.discard_all()

    let turn_event_id = TurnEvents.insert({
      game_id: game._id,
      player_id: game.turn.player._id,
      username: game.turn.player.username,
      type: 'choose_yes_no',
      instructions: `Gain ${CardView.render(trashed_treasure)}?`,
      minimum: 1,
      maximum: 1
    })
    let attacker_player_cards = PlayerCards.findOne({
      player_id: game.turn.player._id,
      game_id: game._id
    })
    let turn_event_processor = new TurnEventProcessor(game, attacker_player_cards, turn_event_id)
    turn_event_processor.process(Thief.gain_trashed_treasure)
  }

  static gain_trashed_treasure(game, player_cards, response) {
    if (response === 'yes') {
      let card_gainer = new CardGainer(game, player_cards.username, player_cards.discard, game.turn.trashed_treasure.name)
      card_gainer.gain_trash_card()
    }
    delete game.turn.trashed_treasure
  }

}
