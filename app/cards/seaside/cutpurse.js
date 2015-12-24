Cutpurse = class Cutpurse extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let gained_coins = CoinGainer.gain(game, player_cards, 2)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)
  }

  attack(game, player_cards) {
    let original_hand_size = _.size(player_cards.hand)

    let card_discarder = new CardDiscarder(game, player_cards, 'hand', 'Copper')
    card_discarder.discard()

    if (_.size(player_cards.hand) === original_hand_size) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.hand)}`)
    }
  }

}
