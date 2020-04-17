ChariotRace = class ChariotRace extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    let top_card, next_player_top_card
    if (_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) {
      if (_.isEmpty(player_cards.deck)) {
        let deck_shuffler = new DeckShuffler(game, player_cards)
        deck_shuffler.shuffle()
      }

      top_card = player_cards.deck.shift()
      player_cards.hand.push(top_card)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(top_card)}, putting it in hand`)
    } else {
      game.log.push(`&nbsp;&nbsp;but <strong>${player_cards.username}</strong> has no cards in deck to reveal`)
    }

    let next_player_query = new NextPlayerQuery(game, player_cards.player_id)
    let next_player_cards = PlayerCardsModel.findOne(game._id, next_player_query.next_player()._id)
    if (_.size(next_player_cards.deck) > 0 || _.size(next_player_cards.discard) > 0) {
      if (_.isEmpty(next_player_cards.deck)) {
        let deck_shuffler = new DeckShuffler(game, next_player_cards)
        deck_shuffler.shuffle()
        PlayerCardsModel.update(game._id, next_player_cards)
      }

      next_player_top_card = next_player_cards.deck[0]
      game.log.push(`&nbsp;&nbsp;<strong>${next_player_cards.username}</strong> reveals ${CardView.render(next_player_top_card)}`)
    } else {
      game.log.push(`&nbsp;&nbsp;but <strong>${next_player_cards.username}</strong> has no cards in deck to reveal`)
    }

    if (top_card && (!next_player_top_card || CardCostComparer.card_less_than(game, top_card, next_player_top_card))) {
      let gained_coins = CoinGainer.gain(game, player_cards, 1)

      if (game.turn.possessed) {
        possessing_player_cards = PlayerCardsModel.findOne(game._id, game.turn.possessed._id)
        possessing_player_cards.victory_tokens += 1
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins} and <strong>${possessing_player_cards.username}</strong> gets +1 &nabla;`)
        PlayerCardsModel.update(game._id, possessing_player_cards)
      } else {
        player_cards.victory_tokens += 1
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins} and +1 &nabla;`)
      }
    }
  }

}
