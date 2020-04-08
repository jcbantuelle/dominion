FarmersMarket = class FarmersMarket extends Card {

  types() {
    return ['action', 'gathering']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards, player) {
    game.turn.buys += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy`)

    let farmers_market_index = _.findIndex(game.cards, (card) => {
      return card.name === 'Farmers Market'
    })
    if (farmers_market_index != -1) {
      let victory_tokens = game.cards[farmers_market_index].victory_tokens
      if (victory_tokens >= 4) {
        if (game.turn.possessed) {
          possessing_player_cards = PlayerCardsModel.findOne(game._id, game.turn.possessed._id)
          possessing_player_cards.victory_tokens += victory_tokens
          game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> gets +${victory_tokens} &nabla;`)
          PlayerCardsModel.update(game._id, possessing_player_cards)
        } else {
          player_cards.victory_tokens += victory_tokens
          game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +${victory_tokens} &nabla;`)
        }
        let card_trasher = new CardTrasher(game, player_cards, 'playing', player.played_card)
        card_trasher.trash()
        game.cards[farmers_market_index].victory_tokens = 0
      } else {
        game.cards[farmers_market_index].victory_tokens += 1
        let gained_coins = CoinGainer.gain(game, player_cards, victory_tokens+1)
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but there is no ${CardView.render(this)} pile`)
    }
  }

}
