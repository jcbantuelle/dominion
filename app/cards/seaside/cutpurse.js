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
    let copper = _.find(player_cards.hand, (card) => {
      return card.name === 'Copper'
    })

    if (copper) {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand', copper)
      card_discarder.discard()
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.hand)}`)
    }
  }

}
