SaltTheEarth = class SaltTheEarth extends Event {

  coin_cost() {
    return 4
  }

  buy(game, player_cards) {
    let victory_token_gainer = new VictoryTokenGainer(game, player_cards)
    victory_token_gainer.gain(1)

    let eligible_cards = _.filter(game.cards, function(card) {
      return _.includes(_.words(card.top_card.types), 'victory') && card.count > 0 && card.supply
    })
    if (_.size(eligible_cards) > 1) {
      GameModel.update(game._id, game)
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
    } else if (_.size(eligible_cards) === 1) {
      SaltTheEarth.trash_card(game, player_cards, eligible_cards)
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    let supply_card_trasher = new SupplyCardTrasher(game, player_cards, selected_cards[0].stack_name, selected_cards[0].top_card)
    supply_card_trasher.trash()
  }

}
