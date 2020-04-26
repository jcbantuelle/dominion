VillagerGainer = class VillagerGainer {

  constructor(game, player_cards, source) {
    this.game = game
    this.player_cards = player_cards
    this.source = source
  }

  gain(amount, announce = true) {
    this.player_cards.villagers += amount
    if (announce) {
      let villager_text = amount == 1 ? 'villager' : 'villagers'
      let source_text = this.source ? ` from ${CardView.render(this.source)}` : ''
      this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> gets +${amount} ${villager_text}${source_text}`)
    }
    return amount
  }

}
