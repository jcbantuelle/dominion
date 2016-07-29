SaltTheEarth = class SaltTheEarth extends Event {

  coin_cost() {
    return 4
  }

  buy(game, player_cards) {
    if (game.turn.possessed) {
      possessing_player_cards = PlayerCardsModel.findOne(game._id, game.turn.possessed._id)
      possessing_player_cards.victory_tokens += 1
      game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> gets +1 &nabla;`)
      PlayerCardsModel.update(game._id, possessing_player_cards)
    } else {
      player_cards.victory_tokens += 1
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 &nabla;`)
    }

    let eligible_cards = _.filter(game.cards, function(card) {
      return _.includes(_.words(card.top_card.types), 'victory') && card.count > 0 && card.top_card.purchasable
    })
    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: 'Choose a victory card to trash:',
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(SaltTheEarth.trash_card)
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    let supply_card_trasher = new SupplyCardTrasher(game, player_cards, selected_cards[0].stack_name, selected_cards[0].top_card)
    supply_card_trasher.trash()
  }

}
