Madman = class Madman extends Card {

  is_purchasable() {
    return false
  }

  types() {
    return ['action']
  }

  coin_cost() {
    return 0
  }

  play(game, player_cards) {
    game.turn.actions += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions`)

    let madman_index = _.findIndex(player_cards.playing, function(card) {
      return card.name === 'Madman'
    })
    if (madman_index !== -1) {
      let madman_pile = _.find(game.cards, function(card) {
        return card.name === 'Madman'
      })

      let madman_card = player_cards.playing.splice(madman_index, 1)[0]

      madman_pile.count += 1
      madman_pile.stack.unshift(madman_card)
      madman_pile.top_card = _.head(madman_pile.stack)

      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> returns ${CardView.render(madman_card)} to the Madman pile`)

      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(_.size(player_cards.hand))
    }
  }

}
