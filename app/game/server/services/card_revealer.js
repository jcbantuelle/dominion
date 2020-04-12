CardRevealer = class CardRevealer {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
  }

  reveal(cards) {
    if (_.size(cards) === 0) {
      this.game.log.push(`&nbsp;&nbsp;but <strong>${this.player_cards.username}</strong> has nothing to reveal`)
    } else {
      this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> reveals ${CardView.render(cards)}`)
    }
  }

  reveal_from_deck(number_to_reveal) {
    let revealed_cards = []
    if (_.size(this.player_cards.deck) !== 0 || _.size(this.player_cards.discard) !== 0) {
      _.times(number_to_reveal, (count) => {
        if (_.size(this.player_cards.deck) === 0 && _.size(this.player_cards.discard) === 0) {
          return false
        } else {
          if (_.size(this.player_cards.deck) === 0) {
            DeckShuffler.shuffle(this.game, this.player_cards)
          }
          revealed_cards.push(this.player_cards.deck.splice(0, 1)[0])
        }
      })
    }
    this.reveal(revealed_cards)
    this.player_cards.revealed = revealed_cards
  }

}
