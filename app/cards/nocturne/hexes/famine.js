Famine = class Famine extends Hex {

  receive(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;but has no cards in deck`)
    } else {
      revealed_cards = _.take(player_cards.deck, 3)
      player_cards.deck = _.drop(player_cards.deck, 3)

      let revealed_card_count = _.size(revealed_cards)
      if (revealed_card_count < 3 && _.size(player_cards.discard) > 0) {
        let deck_shuffler = new DeckShuffler(game, player_cards)
        deck_shuffler.shuffle()
        revealed_cards = revealed_cards.concat(_.take(player_cards.deck, 3 - revealed_card_count))
        player_cards.deck = _.drop(player_cards.deck, 3 - revealed_card_count)
      }

      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(revealed_cards)}`)

      let non_action_cards = []
      _.each(revealed_cards, function(card) {
        if (_.includes(_.words(card.types), 'action')) {
          player_cards.revealed.push(card)
        } else {
          non_action_cards.push(card)
        }
      })

      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard()

      player_cards.deck = _.shuffle(player_cards.deck.concat(non_action_cards))
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> shuffles ${CardView.render(non_action_cards)} into their deck`)
    }
  }

}
