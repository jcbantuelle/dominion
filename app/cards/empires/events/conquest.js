Conquest = class Conquest extends Event {

  coin_cost() {
    return 6
  }

  buy(game, player_cards) {
    _.times(2, function() {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Silver')
      card_gainer.gain()
    })

    let gained_silvers = _.filter(game.turn.gained_cards, function(card) {
      return card.name === 'Silver'
    })
    let victory_token_gainer = new VictoryTokenGainer(game, player_cards)
    victory_token_gainer.gain(_.size(gained_silvers))
  }

}
