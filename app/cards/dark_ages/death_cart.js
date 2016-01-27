DeathCart = class DeathCart extends Card {

  types() {
    return ['action', 'looter']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, player) {
    let gained_coins = CoinGainer.gain(game, player_cards, 5)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)

    let eligible_cards = _.filter(player_cards.hand, function(card) {
      return _.contains(_.words(card.types), 'action')
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
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, player)
      turn_event_processor.process(DeathCart.trash_card)
    } else {
      DeathCart.trash_card(game, player_cards, [], player)
    }

  }

  static trash_card(game, player_cards, selected_cards, player) {
    if (!_.isEmpty(selected_cards)) {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards[0].name)
      card_trasher.trash()
    } else {
      let card_trasher = new CardTrasher(game, player_cards, 'playing', player.card.name)
      card_trasher.trash()
    }
  }

  gain_event(gainer) {
    _.times(2, function() {
      let card_gainer = new CardGainer(gainer.game, gainer.player_cards, 'discard', 'Ruins')
      card_gainer.gain_game_card()
    })
  }

}
