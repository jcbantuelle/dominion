SilkMerchant = class SilkMerchant extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(2)

    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)
  }

  gain_or_trash_event(player, silk_merchant) {
    let coffer_gainer = new CofferGainer(player.game, player.player_cards, silk_merchant)
    coffer_gainer.gain(1)

    let villager_gainer = new VillagerGainer(player.game, player.player_cards, silk_merchant)
    villager_gainer.gain(1)
  }

  gain_event(buyer, silk_merchant) {
    this.gain_or_trash_event(buyer, silk_merchant)
  }

  trash_event(trasher, silk_merchant) {
    this.gain_or_trash_event(trasher, silk_merchant)
  }
}
