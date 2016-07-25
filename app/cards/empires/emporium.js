Emporium = class Emporium extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  stack_name() {
    return 'Patrician/Emporium'
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    let gained_coins = CoinGainer.gain(game, player_cards, 1)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action and +$${gained_coins}`)
  }

  gain_event(gainer) {
    let action_count = _.size(_.filter(gainer.player_cards.in_play.concat(gainer.player_cards.duration).concat(gainer.player_cards.permanent), function(card) {
      return _.includes(_.words(card.types), 'action')
    }))
    if (action_count >= 5) {
      if (gainer.game.turn.possessed) {
        possessing_player_cards = PlayerCardsModel.findOne(gainer.game._id, gainer.game.turn.possessed._id)
        possessing_player_cards.victory_tokens += 2
        gainer.game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> gets +2 &nabla;`)
        PlayerCardsModel.update(gainer.game._id, possessing_player_cards)
      } else {
        gainer.player_cards.victory_tokens += 2
        gainer.game.log.push(`&nbsp;&nbsp;<strong>${gainer.player_cards.username}</strong> gets +2 &nabla;`)
      }
    }
  }

}
