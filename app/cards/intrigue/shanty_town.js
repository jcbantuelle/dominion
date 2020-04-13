ShantyTown = class ShantyTown extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(2)

    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal(player_cards.hand)

    let has_actions = _.some(player_cards.hand, function(card) {
      return _.includes(_.words(card.types), 'action')
    })
    if (!has_actions) {
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(2)
    }
  }

}
