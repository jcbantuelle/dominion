MerchantGuild = class MerchantGuild extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    game.turn.buys += 1
    let gained_coins = CoinGainer.gain(game, player_cards, 1)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy and +$${gained_coins}`)
  }

  buy_event(buyer) {
    let merchant_guild_count = _.size(_.filter(this.player_cards.in_play, function(card) {
      return card.name === 'Merchant Guild'
    }))
    if (merchant_guild_count > 0) {
      if (this.game.turn.possessed) {
        possessing_player_cards = PlayerCardsModel.findOne(this.game._id, this.game.turn.possessed._id)
        possessing_player_cards.coin_tokens += merchant_guild_count
        this.game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> takes ${merchant_guild_count} coin token(s) from ${CardView.render(new MerchantGuild())}`)
        PlayerCardsModel.update(this.game._id, possessing_player_cards)
      } else {
        this.player_cards.coin_tokens += merchant_guild_count
        this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> takes ${merchant_guild_count} coin token(s) from ${CardView.render(new MerchantGuild())}`)
      }
    }
  }

}
