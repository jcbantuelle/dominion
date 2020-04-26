Swashbuckler = class Swashbuckler extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(3)

    if (_.size(player_cards.discard) > 0) {
      let coffer_gainer = new CofferGainer(game, player_cards)
      coffer_gainer.gain(1)

      if (player_cards.coffers > 3) {
        let card_mover = new CardMover(game, player_cards)
        card_mover.take_unique_card('artifacts', 'Treasure Chest')
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but the discard is empty`)
    }
  }

}
