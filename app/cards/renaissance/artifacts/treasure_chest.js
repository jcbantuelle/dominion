TreasureChest = class TreasureChest extends Artifact {

  start_buy_event(game, player_cards, treasure_chest) {
    game.log.push(`<strong>${player_cards.username}</strong> resolves ${CardView.render(treasure_chest)}`)
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Gold')
    card_gainer.gain()
  }
}
