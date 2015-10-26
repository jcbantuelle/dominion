Moneylender = class Moneylender extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let copper = this.find_copper(player_cards)
    if (copper !== -1) {
      game.trash.push(player_cards.hand[copper])
      game.turn.coins += 3
      player_cards.hand.splice(copper, 1)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> trashes a <span class="treasure">Copper</span>, getting +$3`)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no copper to trash`)
    }

    Games.update(game._id, game)
    PlayerCards.update(player_cards._id, player_cards)
  }

  find_copper(player_cards) {
    return _.findIndex(player_cards.hand, function(card) {
      return card.name === 'Copper'
    })
  }

}
