MagicLamp = class MagicLamp extends Card {

  types() {
    return ['treasure', 'heirloom']
  }

  coin_cost() {
    return 0
  }

  play(game, player_cards, player) {
    CoinGainer.gain(game, player_cards, 1)

    let grouped_cards_in_play = _.groupBy(player_cards.playing.concat(player_cards.in_play).concat(player_cards.duration).concat(player_cards.permanent), function(card) {
      return card.name
    })
    let card_counts = _.map(grouped_cards_in_play, function(cards, card_name) {
      return _.size(cards)
    })
    let unique_card_count = _.size(_.filter(card_counts, function(count) {
      return count === 1
    }))

    if (unique_card_count >= 6) {
      let card_trasher = new CardTrasher(game, player_cards, 'playing', player.played_card)
      card_trasher.trash()

      _.times(3, function() {
        let card_gainer = new CardGainer(game, player_cards, 'discard', 'Wish')
        card_gainer.gain()
      })
    }
  }

}
