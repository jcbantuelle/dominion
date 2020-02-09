Experiment = class Experiment extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)

    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    let experiment_index = _.findIndex(player_cards.playing, function (card) {
      return card.name === 'Experiment'
    })
    if (experiment_index !== -1) {
      let experiment_pile = _.find(game.cards, function (card) {
        return card.name === 'Experiment'
      })

      let experiment_card = player_cards.playing.splice(experiment_index, 1)[0]

      experiment_pile.count += 1
      experiment_pile.stack.unshift(experiment_card)
      experiment_pile.top_card = _.head(experiment_pile.stack)

      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> returns ${CardView.render(this)} to the supply`)
    }
  }

  gain_event(gainer) {
    if (gainer.game.turn.experiment_gained) {
      gainer.game.turn.experiment_gained = false
    } else {
      gainer.game.turn.experiment_gained = true
      let card_gainer = new CardGainer(gainer.game, gainer.player_cards, 'discard', 'Experiment')
      card_gainer.gain_game_card()
    }
  }

}
