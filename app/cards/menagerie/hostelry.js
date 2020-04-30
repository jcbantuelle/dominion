Hostelry = class Hostelry extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(2)
  }

  gain_event(gainer) {
    let eligible_treasures = _.filter(gainer.player_cards.hand, function(card) {
      return _.includes(_.words(card.types), 'treasure')
    })
    if (_.size(eligible_treasures) > 0) {
      GameModel.update(gainer.game._id, gainer.game)
      let turn_event_id = TurnEventModel.insert({
        game_id: gainer.game._id,
        player_id: gainer.player_cards.player_id,
        username: gainer.player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose any number of treasures to discard:',
        cards: eligible_treasures,
        minimum: 0,
        maximum: _.size(eligible_treasures)
      })
      let turn_event_processor = new TurnEventProcessor(gainer.game, gainer.player_cards, turn_event_id)
      turn_event_processor.process(Hostelry.discard_treasures)
    } else {
      gainer.game.log.push(`&nbsp;&nbsp;but chooses not to discard anything`)
    }
  }

  static discard_treasures(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;but chooses not to discard anything`)
    } else {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
      card_discarder.discard()

      _.times(_.size(selected_cards), () => {
        let card_gainer = new CardGainer(game, player_cards, 'discard', 'Horse')
        card_gainer.gain()
      })
    }
  }

}
