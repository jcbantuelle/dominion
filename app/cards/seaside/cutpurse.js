Cutpurse = class Cutpurse extends Card {

  types() {
    return this.capitalism_types(['action', 'attack'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let coin_gainer = new CoinGainer(game, player_cards, card_player)
    coin_gainer.gain(2)

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
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal('hand')
    }
  }

}
