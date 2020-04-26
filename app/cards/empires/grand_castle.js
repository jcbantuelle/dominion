GrandCastle = class GrandCastle extends Castles {

  coin_cost() {
    return 9
  }

  victory_points(player_cards) {
    return 5
  }

  gain_event(gainer) {
    let card_revealer = new CardRevealer(gainer.game, gainer.player_cards)
    card_revealer.reveal('hand')

    let victory_card_count = _.size(_.filter(gainer.player_cards.hand.concat(gainer.player_cards.in_play), function(card) {
      return _.includes(_.words(card.types), 'victory')
    }))
    let victory_token_gainer = new VictoryTokenGainer(gainer.game, gainer.player_cards)
    victory_token_gainer.gain(victory_card_count)
  }

}
