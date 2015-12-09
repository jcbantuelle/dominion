Knights = class Knights extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4.5
  }

  stack_name() {
    return 'Knights'
  }

  attack(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      player_cards.revealed = _.take(player_cards.deck, 2)
      player_cards.deck = _.drop(player_cards.deck, 2)

      let revealed_card_count = _.size(player_cards.revealed)
      if (revealed_card_count < 2 && _.size(player_cards.discard) > 0) {
        DeckShuffler.shuffle(game, player_cards)
        player_cards.revealed = player_cards.revealed.concat(_.take(player_cards.deck, 2 - revealed_card_count))
        player_cards.deck = _.drop(player_cards.deck, 2 - revealed_card_count)
      }

      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.revealed)}`)

      let all_player_cards = PlayerCardsModel.find(game._id)

      let eligible_cards = _.filter(player_cards.revealed, function(card) {
        let coin_cost = CostCalculator.calculate(game, card, all_player_cards)
        return coin_cost >= 3 && coin_cost <= 6 && card.potion_cost === 0
      })

      if (_.isEmpty(eligible_cards)) {
        game.log.push(`&nbsp;&nbsp;but there are no cards costing between $3 and $6`)
      } else if (_.size(eligible_cards) === 1) {
        Knights.trash_revealed(game, player_cards, eligible_cards)
      } else {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: `Choose a card to trash:`,
          cards: eligible_cards,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Knights.trash_revealed)
      }

      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard()
    }
  }

  trash_knight(game, player_cards) {
    if (game.turn.trashed_knight) {
      let card_trasher = new CardTrasher(game, player_cards, 'playing', this.name())
      card_trasher.trash()
    }
    delete game.turn.trashed_knight
  }

  static trash_revealed(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    let card_trasher = new CardTrasher(game, player_cards, 'revealed', selected_card.name)
    card_trasher.trash()

    if (selected_card.stack_name === 'Knights') {
      game.turn.trashed_knight = true
    }
  }

}
