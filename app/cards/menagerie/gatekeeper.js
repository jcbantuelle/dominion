Gatekeeper = class Gatekeeper extends Duration {

  types() {
    return this.capitalism_types(['action', 'duration', 'attack'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let player_attacker = new PlayerAttacker(game, this, card_player)
    player_attacker.attack(player_cards)

    player_cards.duration_effects.push(_.clone(card_player.card))
    return 'duration'
  }

  attack(game, player_cards, attacker_player_cards, card_player) {
    let attack_card = _.clone(card_player.card)
    attack_card.player_source = game.turn.player
    player_cards.duration_attacks.push(attack_card)
  }

  duration(game, player_cards, gatekeeper) {
    let coin_gainer = new CoinGainer(game, player_cards, gatekeeper)
    coin_gainer.gain(3)
  }

  gain_event(gainer, gatekeeper) {
    if (gainer.destination !== 'exile') {
      let card_mover = new CardMover(gainer.game, gainer.player_cards)
      card_mover.move(gainer.player_cards[gainer.destination], gainer.player_cards.exile, gainer.gained_card)
      gainer.game.log.push(`&nbsp;&nbsp;<strong>${gainer.player_cards.username}</strong> exiles ${CardView.render(gainer.gained_card)} due to ${CardView.render(gatekeeper)}`)
      gainer.destination = 'exile'
    }
  }

}
