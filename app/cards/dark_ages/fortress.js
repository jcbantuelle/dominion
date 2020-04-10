Fortress = class Fortress extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions`)
  }

  trash_event(trasher, fortress) {
    let fortress_index = _.findIndex(trasher.player_cards.trashing, function(card) {
      return card.id === fortress.id
    })
    if (trasher.player_cards.trashing[fortress_index].misfit) {
      trasher.player_cards.trashing[fortress_index] = trasher.player_cards.trashing[fortress_index].misfit
    }
    trasher.player_cards.hand.push(trasher.player_cards.trashing.splice(fortress_index, 1)[0])
    trasher.game.log.push(`&nbsp;&nbsp;<strong>${trasher.player_cards.username}</strong> puts ${CardView.render(trash_card)} in their hand`)
  }

}
