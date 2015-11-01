Moneylender = class Moneylender extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let original_hand_size = _.size(player_cards.hand)
    let card_trasher = new CardTrasher(game, player_cards.username, player_cards.hand, 'Copper')
    card_trasher.trash()
    if (_.size(player_cards.hand) < original_hand_size) {
      game.turn.coins += 3
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$3`)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no copper to trash`)
    }

    Games.update(game._id, game)
    PlayerCards.update(player_cards._id, player_cards)
  }

}
