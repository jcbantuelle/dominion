Piazza = class Piazza extends Project {

  coin_cost() {
    return 5
  }

  start_turn_event(game, player_cards, piazza) {
    game.log.push(`<strong>${player_cards.username}</strong> resolves ${CardView.render(piazza)}`)
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(1)

      if (_.includes(_.words(player_cards.revealed[0].types), 'action')) {
        let card_player = new CardPlayer(game, player_cards, player_cards.revealed[0])
        card_player.play(true, true, 'revealed')
      } else {
        let card_mover = new CardMover(game, player_cards)
        card_mover.move_all(player_cards.revealed, player_cards.deck)
      }
    }
  }

}
