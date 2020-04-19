Knights = class Knights extends Card {

  types() {
    return ['action', 'attack', 'knight']
  }

  coin_cost() {
    return 4.5
  }

  stack_name() {
    return 'Knights'
  }

  attack(game, player_cards, attacker_player_cards, card_player) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(2)

      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)

      let eligible_cards = _.filter(player_cards.revealed, function(card) {
        return CardCostComparer.coin_between(game, card, 3, 6)
      })
      if (_.size(eligible_cards) === 1) {
        Knights.trash_revealed(game, player_cards, eligible_cards, card_player)
      } else if (_.size(eligible_cards) > 1) {
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
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card_player)
        turn_event_processor.process(Knights.trash_revealed)
      }
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard()
    }
  }

  static trash_revealed(game, player_cards, selected_cards, card_player) {
    let selected_card = selected_cards[0]
    let card_trasher = new CardTrasher(game, player_cards, 'revealed', selected_card)
    card_trasher.trash()

    if (selected_card.stack_name === 'Knights') {
      let card_trasher = new CardTrasher(game, card_player.player_cards, 'in_play', card_player.card)
      card_trasher.trash()
    }
  }

}
