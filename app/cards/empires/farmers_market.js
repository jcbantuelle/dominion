FarmersMarket = class FarmersMarket extends Card {

  types() {
    return this.capitalism_types(['action', 'gathering'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards, card_player) {
    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    let farmers_market_index = _.findIndex(game.cards, (card) => {
      return card.name === 'Farmers Market'
    })
    if (farmers_market_index != -1) {
      let victory_tokens = game.cards[farmers_market_index].victory_tokens
      if (victory_tokens >= 4) {
        let victory_token_gainer = new VictoryTokenGainer(game, player_cards)
        victory_token_gainer.gain(victory_tokens)
        game.cards[farmers_market_index].victory_tokens = 0

        let card_trasher = new CardTrasher(game, player_cards, 'in_play', card_player.card)
        card_trasher.trash()
      } else {
        game.cards[farmers_market_index].victory_tokens += 1
        let coin_gainer = new CoinGainer(game, player_cards)
        coin_gainer.gain(1)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but there is no ${CardView.render(card_player.card)} pile`)
    }
  }

}
