Rebuild = class Rebuild extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    if (_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) {
      PlayerCardsModel.update(game._id, player_cards)

      let unique_cards = _.uniqBy(AllPlayerCardsQuery.find(player_cards), 'name')

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Name a card:',
        cards: unique_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Rebuild.name_card)

      this.reveal(game, player_cards)

      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard()

      if (player_cards.revealed_victory_card) {
        player_cards.revealed.push(player_cards.revealed_victory_card)
        let card_trasher = new CardTrasher(game, player_cards, 'revealed', player_cards.revealed_victory_card)
        card_trasher.trash()

        let eligible_cards = _.filter(game.cards, function(card) {
          return card.count > 0 && card.top_card.purchasable && _.includes(_.words(card.top_card.types), 'victory') && CardCostComparer.card_less_than(game, player_cards.revealed_victory_card, card.top_card, 4)
        })

        if (_.size(eligible_cards) > 0) {
          GameModel.update(game._id, game)
          let turn_event_id = TurnEventModel.insert({
            game_id: game._id,
            player_id: player_cards.player_id,
            username: player_cards.username,
            type: 'choose_cards',
            game_cards: true,
            instructions: 'Choose a victory card to gain:',
            cards: eligible_cards,
            minimum: 1,
            maximum: 1
          })
          let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
          turn_event_processor.process(Rebuild.gain_card)
        } else {
          game.log.push(`&nbsp;&nbsp;but there are no available victory cards to gain`)
        }
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no victory cards to trash`)
      }

      delete game.turn.rebuild_named_card
      delete player_cards.revealed_victory_card
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in deck to reveal`)
    }
  }

  reveal(game, player_cards) {
    let revealed_cards = []
    while((_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) && !player_cards.revealed_victory_card) {
      if (_.size(player_cards.deck) === 0) {
        let deck_shuffler = new DeckShuffler(game, player_cards)
        deck_shuffler.shuffle()
      }
      let card = player_cards.deck.shift()
      revealed_cards.push(card)
      if (_.includes(_.words(card.types), 'victory') && card.name !== game.turn.rebuild_named_card.name) {
        player_cards.revealed_victory_card = card
      } else {
        player_cards.revealed.push(card)
      }
    }
    if (!_.isEmpty(revealed_cards)) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(revealed_cards)}`)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in their deck`)
    }
  }

  static name_card(game, player_cards, selected_cards) {
    game.turn.rebuild_named_card = selected_cards[0]
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> names ${CardView.render(game.turn.rebuild_named_card)}`)
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain()
  }

}
