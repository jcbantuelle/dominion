Cutpurse = class Cutpurse extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    game.turn.coins += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$2`)
  }

  attack(game, player_cards) {
    let original_hand_size = _.size(player_cards.hand)

    let card_discarder = new CardDiscarder(game, player_cards, 'hand')
    card_discarder.discard_by_name('Copper')

    if (_.size(player_cards.hand) < original_hand_size) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> discards <span class="treasure">Copper</span>`)
    } else {
      let cards = _.map(player_cards.hand, function(card) {
        return `<span class="${card.types}">${card.name}</span>`
      }).join(' ')
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${cards}`)
    }
  }

}
