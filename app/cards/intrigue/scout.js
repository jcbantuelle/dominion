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

      let victory_cards = _.filter(player_cards.revealed, (card) => {
        return _.includes(_.words(card.types), 'victory')
      })
      if (!_.isEmpty(victory_cards)) {
        _.each(victory_cards, function(card) {
          let card_mover = new CardMover(game, player_cards)
          card_mover.move(player_cards.revealed, player_cards.hand, card)
        })
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(victory_cards)} in hand`)
      }

      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)

      let card_returner = new CardReturner(game, player_cards)
      card_returner.return_to_deck(player_cards.revealed)
    }
  }

}



