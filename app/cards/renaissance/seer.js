Seer = class Seer extends Card {

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

    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;but has no cards in deck`)
    } else {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(3)

      let two_to_four_cards = _.filter(player_cards.revealed, (card) => {
        return CardCostComparer.coin_between(game, card, 2, 4)
      })

      if (!_.isEmpty(two_to_four_cards)) {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(two_to_four_cards)} in their hand`)
        let card_mover = new CardMover(game, player_cards)
        _.each(two_to_four_cards, (card) => {
          card_mover.move(player_cards.revealed, player_cards.hand, card)
        })
      }

      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)

      let card_returner = new CardReturner(game, player_cards)
      card_returner.return_to_deck(player_cards.revealed)
    }
  }

}
