Reap = class Reap extends Event {

  coin_cost() {
    return 7
  }

  buy(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'aside', 'Gold')
    let gained_gold = card_gainer.gain()

    if (gained_gold) {
      let reap = this.to_h()
      reap.target = gained_gold
      player_cards.start_turn_event_effects.push(reap)
    }
  }

  start_turn_event(game, player_cards, reap) {
    game.log.push(`<strong>${player_cards.username}</strong> resolves ${CardView.render(reap)}`)
    let card_player = new CardPlayer(game, player_cards, reap.target)
    card_player.play(true, true, 'aside')
  }

}
