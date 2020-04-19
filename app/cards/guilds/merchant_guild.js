MerchantGuild = class MerchantGuild extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(1)
  }

  buy_event(buyer, merchant_guild) {
    let coffer_gainer = new CofferGainer(buyer.game, buyer.player_cards, merchant_guild)
    coffer_gainer.gain(1)
  }

}
