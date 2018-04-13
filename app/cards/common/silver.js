Silver = class Silver extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let gained_coin = 2
    if (game.turn.envious) {
      gained_coin = 1
    }
    CoinGainer.gain(game, player_cards, gained_coin)

    if (game.turn.played_merchant && !game.turn.gained_merchant_silver) {
      game.turn.gained_merchant_silver = true
      let gained_coins = CoinGainer.gain(game, player_cards, 1)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins} from ${CardView.card_html('action', 'Merchant')}`)
    }

    let sauna_count = _.size(_.filter(player_cards.in_play.concat(player_cards.duration).concat(player_cards.permanent), function(card) {
      return card.name === 'Sauna'
    }))
    if (sauna_count > 0 && _.size(player_cards.hand) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose up to ${sauna_count} card(s) to trash:`,
        cards: player_cards.hand,
        minimum: 0,
        maximum: sauna_count
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Silver.trash_cards)
    }
  }

  static trash_cards(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;but does not trash anything`)
    } else {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', _.map(selected_cards, 'name'))
      card_trasher.trash()
    }
  }

}
