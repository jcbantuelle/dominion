Ghost = class Ghost extends Duration {

  types() {
    return ['night', 'duration', 'spirit']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal_from_deck_until((game, player_cards, revealed_cards) => {
      if (!_.isEmpty(revealed_cards)) {
        return _.includes(_.words(_.last(revealed_cards).types), 'action')
      } else {
        return false
      }
    })
    let last_revealed = _.last(player_cards.revealed)
    let ghost = false

    if (_.includes(_.words(last_revealed.types), 'action')) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside ${CardView.render(last_revealed)}`)
      let card_mover = new CardMover(game, player_cards)
      card_mover.move(player_cards.revealed, player_cards.aside, last_revealed)

      ghost = _.clone(card_player.card)
      ghost.ghost_card = last_revealed
      player_cards.duration_effects.push(ghost)
    }

    let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
    card_discarder.discard()

    if (ghost) {
      return 'duration'
    }
  }

  duration(game, player_cards, ghost) {
    game.log.push(`<strong>${player_cards.username}</strong> resolves ${CardView.render(ghost)}`)
    let card_player = new CardPlayer(game, player_cards, ghost.ghost_card, ghost)
    card_player.play(true, true, 'aside', 2)
  }


}
