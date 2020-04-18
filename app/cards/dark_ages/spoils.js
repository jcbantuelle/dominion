Spoils = class Spoils extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 0
  }

  play(game, player_cards, card_player) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(3, false)

    let card_mover = new CardMover(game, player_cards)
    let return_count = card_mover.return_to_supply(player_cards.in_play, 'Spoils', [card_player.card])

    if (return_count === 1) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> returns ${CardView.render(card_player.card)} to the ${CardView.render(card_player.card)} pile`)
    }

  }

}
