JackOfAllTrades = class JackOfAllTrades extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Silver')
    card_gainer.gain_game_card()

    GameModel.update(game._id, game)
    PlayerCardsModel.update(game._id, player_cards)

    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      if (_.size(player_cards.deck) === 0) {
        DeckShuffler.shuffle(player_cards)
      }

      let revealed_card = player_cards.deck.shift()
      player_cards.revealed.push(revealed_card)

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: game.turn.player._id,
        username: game.turn.player.username,
        type: 'choose_yes_no',
        instructions: `Discard ${CardView.render(revealed_card)}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(JackOfAllTrades.discard_card)
    }

    GameModel.update(game._id, game)
    PlayerCardsModel.update(game._id, player_cards)

    if (_.size(player_cards.hand) >= 5) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> already has 5 or more cards in hand`)
    } else if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck to draw`)
    } else {
      this.draw_to_five(game, player_cards)
    }

    GameModel.update(game._id, game)
    PlayerCardsModel.update(game._id, player_cards)

    if (_.size(player_cards.hand) === 0) {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    } else {
      let eligible_cards = _.filter(player_cards.hand, function(card) {
        return !_.contains(card.types, 'treasure')
      })
      if (_.size(eligible_cards) > 0) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose a card to trash (Or none to skip):',
          cards: eligible_cards,
          minimum: 0,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(JackOfAllTrades.trash_card)
      } else {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> does not trash anything`)
      }
    }
  }

  static discard_card(game, player_cards, response) {
    if (response === 'yes') {
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard_all()
    } else {
      let card = player_cards.revealed[0]
      player_cards.deck.unshift(card)
      player_cards.revealed = []
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts their card back on top of deck`)
    }
  }

  draw_to_five(game, player_cards) {
    if (_.size(player_cards.hand) >= 5 || (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0)) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> draws up to ${_.size(player_cards.hand)} cards in hand`)
    } else {
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(1)
      this.draw_to_five(game, player_cards)
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> does not trash anything`)
    } else {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards[0].name)
      card_trasher.trash()
    }
  }

}
