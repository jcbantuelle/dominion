Idol = class Idol extends Card {

  types() {
    return ['treasure', 'attack', 'fate']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    CoinGainer.gain(game, player_cards, 2)

    let idol_count = _.size(_.filter(player_cards.in_play.concat(player_cards.playing).concat(player_cards.duration).concat(player_cards.permanent), function(card) {
      return card.name === 'Idol'
    }))

    if (idol_count % 2 === 0) {
      let player_attacker = new PlayerAttacker(game, this)
      player_attacker.attack(player_cards)
    } else {
      let boon_receiver = new EffectReceiver(game, player_cards, 'boon')
      boon_receiver.receive()
    }
  }

  attack(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Curse')
    card_gainer.gain()
  }

}
