Adventurer = class Adventurer extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 6
  }

  play(game, player_cards) {
    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal_from_deck_until((revealed_cards) => {
      let treasures = _.filter(revealed_cards, (card) => {
        return _.includes(_.words(card.types), 'treasure')
      })
      return _.size(treasures) === 2
    })

    let treasures = _.filter(player_cards.revealed, (card) => {
      return _.includes(_.words(card.types), 'treasure')
    })
    _.each(treasures, (treasure) => {
      let card_mover = new CardMover(game, player_cards)
      card_mover.move(player_cards.revealed, player_cards.hand, treasure)
    })

    let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
    card_discarder.discard(false)

    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(treasures)} in hand and discards the rest`)
  }

}
