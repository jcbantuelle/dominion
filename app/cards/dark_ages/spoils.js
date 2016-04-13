Spoils = class Spoils extends Card {

  is_purchasable() {
    false
  }

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 0
  }

  play(game, player_cards) {
    CoinGainer.gain(game, player_cards, 3)

    let spoils_index = _.findIndex(player_cards.playing, function(card) {
      return card.name === 'Spoils'
    })

    if (spoils_index !== -1) {

      let spoils_pile = _.find(game.cards, function(card) {
        return card.name === 'Spoils'
      })

      let spoils_card = player_cards.playing.splice(spoils_index, 1)[0]

      spoils_pile.count += 1
      spoils_pile.stack.unshift(spoils_card)
      spoils_pile.top_card = _.head(spoils_pile.stack)

      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> returns ${CardView.render(this)} to the Spoils pile`)
    }

  }

}
