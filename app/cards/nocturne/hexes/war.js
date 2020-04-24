War = class War extends Hex {

  receive(game, player_cards) {
    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal_from_deck_until((game, player_cards, revealed_cards) => {
      if (!_.isEmpty(revealed_cards)) {
        return CardCostComparer.coin_between(game, _.last(revealed_cards), 3, 4)
      } else {
        return false
      }
    })
    let last_revealed = _.last(player_cards.revealed)
    if (CardCostComparer.coin_between(game, last_revealed, 3, 4)) {
      let card_trasher = new CardTrasher(game, player_cards, 'revealed', last_revealed)
      card_trasher.trash()
    }
    let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
    card_discarder.discard()
  }

}
