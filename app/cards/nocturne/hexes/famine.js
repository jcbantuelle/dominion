Famine = class Famine extends Hex {

  receive(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;but has no cards in deck`)
    } else {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(3)

      let actions = _.filter(player_cards.revealed, (card) => {
        return _.includes(_.words(card.types), 'action')
      })

      let card_discarder = new CardDiscarder(game, player_cards, 'revealed', actions)
      card_discarder.discard()

      if (_.size(player_cards.revealed) > 0) {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> shuffles ${CardView.render(player_cards.revealed)} into their deck`)
        let deck_shuffler = new DeckShuffler(game, player_cards)
        deck_shuffler.shuffle('revealed')
      }
    }
  }

}
