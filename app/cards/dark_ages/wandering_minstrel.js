WanderingMinstrel = class WanderingMinstrel extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(2)

    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;but has no cards in deck`)
    } else {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(3)

      player_cards.minstrel_actions = []
      _.each(_.clone(player_cards.revealed), (card) => {
        if (_.includes(_.words(card.types), 'action')) {
          let card_mover = new CardMover(game, player_cards)
          card_mover.move(player_cards.revealed, player_cards.minstrel_actions, card)
        }
      })
      let card_returner = new CardReturner(game, player_cards)
      card_returner.return_to_deck(player_cards.minstrel_actions)
      delete player_cards.minstrel_actions

      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard()
    }
  }

}
