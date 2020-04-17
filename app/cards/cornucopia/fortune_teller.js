FortuneTeller = class FortuneTeller extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)
  }

  attack(game, player_cards) {
    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal_from_deck_until((game, revealed_cards) => {
      if (!_.isEmpty(revealed_cards)) {
        return _.includes(_.words(_.last(revealed_cards).types), 'victory') || _.last(revealed_cards).name === 'Curse'
      } else {
        return false
      }
    })

    let last_revealed = _.last(player_cards.revealed)
    if (_.includes(_.words(last_revealed.types), 'victory') || last_revealed.name === 'Curse') {
      let card_mover = new CardMover(game, player_cards)
      card_mover.move(player_cards.revealed, player_cards.deck, last_revealed)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(last_revealed)} on top of their deck`)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no victory cards or curses in their deck`)
    }

    let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
    card_discarder.discard()
  }

}
