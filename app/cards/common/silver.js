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
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(gained_coin, false)

    if (game.turn.merchants > 0 && !game.turn.played_silver) {
      let coin_gainer = new CoinGainer(game, player_cards)
      gained_coin = coin_gainer.gain(game.turn.merchants, false)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coin} from ${CardView.render(new Merchant())}`)
    }
    game.turn.played_silver = true

    let sauna_count = _.size(_.filter(player_cards.in_play, (card) => {
      return card.name === 'Sauna'
    }))
    if (sauna_count > 0) {
      if (_.size(player_cards.hand) > 0) {
        let card_text = sauna_count === 1 ? 'card' : 'cards'
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: `Choose up to ${sauna_count} ${card_text} to trash:`,
          cards: player_cards.hand,
          minimum: 0,
          maximum: sauna_count
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Silver.trash_cards)
      } else {
        game.log.push(`&nbsp;&nbsp;but has no cards in hand`)
      }
    }
  }

  static trash_cards(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;but does not trash anything`)
    } else {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
      card_trasher.trash()
    }
  }

}
