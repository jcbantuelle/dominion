HauntedWoods = class HauntedWoods extends Duration {

  types() {
    return ['action', 'duration', 'attack']
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

  duration(game, player_cards, haunted_woods) {
    let card_drawer = new CardDrawer(game, player_cards, undefined, haunted_woods)
    let drawn_count = card_drawer.draw(3)
  }

  buy_event(buyer) {
    if (_.size(buyer.player_cards.hand) === 0) {
      buyer.game.log.push(`&nbsp;&nbsp;<strong>${buyer.player_cards.username}</strong> has no cards in hand for ${CardView.render(this)}`)
    } else {
      let card_returner = new CardReturner(buyer.game, buyer.player_cards)
      card_returner.return_to_deck(buyer.player_cards.hand)
    }
  }

}
