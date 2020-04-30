Coven = class Coven extends Card {

  types() {
    return this.capitalism_types(['action', 'attack'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)
  }

  attack(game, player_cards) {
    let curse = _.find(game.cards, (card) => {
      return card.name === 'Curse' && card.count > 0
    })
    if (curse) {
      let supply_card_exiler = new SupplyCardExiler(game, player_cards, curse.stack_name, curse.top_card)
      supply_card_exiler.exile()
    } else {
      let curses = _.filter(player_cards.exile, (card) => {
        return card.name === 'Curse'
      })
      let card_discarder = new CardDiscarder(game, player_cards, 'exile', curses)
      card_discarder.discard()
    }
  }

}
