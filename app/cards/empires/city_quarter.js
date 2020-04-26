CityQuarter = class CityQuarter extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 0
  }

  debt_cost() {
    return 8
  }

  play(game, player_cards) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(2)

    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal('hand')

    let action_count = _.size(_.filter(player_cards.hand, function(card) {
      return _.includes(_.words(card.types), 'action')
    }))

    if (action_count > 0) {
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(action_count)
    } else {
      game.log.push(`&nbsp;&nbsp;but has no actions in hand`)
    }

  }

}
