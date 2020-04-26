Sage = class Sage extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal_from_deck_until((game, player_cards, revealed_cards) => {
      if (!_.isEmpty(revealed_cards)) {
        return CardCostComparer.coin_greater_than(game, _.last(revealed_cards), 2)
      } else {
        return false
      }
    })

    let last_revealed = _.last(player_cards.revealed)
    if (CardCostComparer.coin_greater_than(game, last_revealed, 2)) {
      let card_mover = new CardMover(game, player_cards)
      card_mover.move(player_cards.revealed, player_cards.hand, last_revealed)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(last_revealed)} in their hand`)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards costing $3 or more`)
    }

    let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
    card_discarder.discard()
  }

}
