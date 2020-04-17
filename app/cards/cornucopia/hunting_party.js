HuntingParty = class HuntingParty extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal('hand')

    card_revealer.reveal_from_deck_until((game, player_cards, revealed_cards) => {
      if (!_.isEmpty(revealed_cards)) {
        return !_.includes(_.map(player_cards.hand, 'name'), _.last(revealed_cards).name)
      } else {
        return false
      }
    })

    let last_revealed = _.last(player_cards.revealed)
    if (!_.includes(_.map(player_cards.hand, 'name'), last_revealed.name)) {
      let card_mover = new CardMover(game, player_cards)
      card_mover.move(player_cards.revealed, player_cards.hand, last_revealed)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(last_revealed)} in their hand`)
    }

    let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
    card_discarder.discard()
  }

}
