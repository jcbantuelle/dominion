Venture = class Venture extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(1, false)

    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal_from_deck_until((game, revealed_cards) => {
      if (!_.isEmpty(revealed_cards)) {
        return _.includes(_.words(_.last(revealed_cards).types), 'treasure')
      } else {
        return false
      }
    })

    let non_treasures = _.filter(player_cards.revealed, (card) => {
      return !_.includes(_.words(card.types), 'treasure')
    })
    let card_discarder = new CardDiscarder(game, player_cards, 'revealed', non_treasures)
    card_discarder.discard()

    if (_.isEmpty(player_cards.revealed)) {
      game.log.push(`&nbsp;&nbsp;but there is no treasure to play`)
    } else {
      let card_player = new CardPlayer(game, player_cards, player_cards.revealed[0])
      card_player.play(true, true, 'revealed')
    }
  }

}
