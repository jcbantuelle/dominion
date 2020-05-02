Menagerie = class Menagerie extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards, card_player) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal('hand')

    let unique_cards = _.uniqBy(player_cards.hand, 'name')
    let card_count = _.size(unique_cards) === _.size(player_cards.hand) ? 3 : 1

    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(card_count)
  }

}
