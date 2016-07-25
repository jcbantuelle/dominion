GrandCastle = class GrandCastle extends Castles {

  coin_cost() {
    return 9
  }

  victory_points(player_cards) {
    return 5
  }

  gain_event(gainer) {
    if (_.size(gainer.player_cards) > 0) {
      gainer.game.log.push(`&nbsp;&nbsp;<strong>${gainer.player_cards.username}</strong> reveals ${CardView.render(gainer.player_cards.hand)}`)
    } else {
      gainer.game.log.push(`&nbsp;&nbsp;<strong>${gainer.player_cards.username}</strong> reveals an empty hand`)
    }

    let victory_card_count = _.size(_.filter(gainer.player_cards.hand.concat(gainer.player_cards.in_play).concat(gainer.player_cards.playing).concat(gainer.player_cards.duration).concat(gainer.player_cards.permanent), function(card) {
      return _.includes(_.words(card.types), 'victory')
    }))
    if (victory_card_count > 0) {
      gainer.player_cards.victory_tokens += victory_card_count
      gainer.game.log.push(`&nbsp;&nbsp;<strong>${gainer.player_cards.username}</strong> gets +${victory_card_count} &nabla;`)
    }
  }

}
