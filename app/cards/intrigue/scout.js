Scout = class Scout extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;but has no cards in deck`)
    } else {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(4)

      _.each(_.clone(player_cards.revealed), function(card) {
        if (_.includes(_.words(card.types), 'victory')) {
          let card_mover = new CardMover(game, player_cards)
          card_mover.move(player_cards.revealed, player_cards.hand, card)
        }
      })

      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)

      let card_returner = new CardReturner(game, player_cards)
      card_returner.return_to_deck(player_cards.revealed)
    }
  }

}



