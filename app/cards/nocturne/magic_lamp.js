MagicLamp = class MagicLamp extends Card {

  types() {
    return ['treasure', 'heirloom']
  }

  coin_cost() {
    return 0
  }

  play(game, player_cards, card_player) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(1, false)

    let unique_cards_in_play = _.uniqBy(player_cards.in_play, 'name')

    if (_.size(unique_cards_in_play) >= 6) {
      let card_trasher = new CardTrasher(game, player_cards, 'in_play', card_player.card)
      card_trasher.trash()

      _.times(3, function() {
        let card_gainer = new CardGainer(game, player_cards, 'discard', 'Wish')
        card_gainer.gain()
      })
    }
  }

}
