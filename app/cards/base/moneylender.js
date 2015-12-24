Moneylender = class Moneylender extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let original_hand_size = _.size(player_cards.hand)
    let card_trasher = new CardTrasher(game, player_cards, 'hand', 'Copper')
    card_trasher.trash()
    if (_.size(player_cards.hand) < original_hand_size) {
      let gained_coins = CoinGainer.gain(game, player_cards, 3)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no copper to trash`)
    }
  }

}
