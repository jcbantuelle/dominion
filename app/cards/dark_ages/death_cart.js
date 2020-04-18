DeathCart = class DeathCart extends Card {

  types() {
    return ['action', 'looter']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let eligible_cards = _.chain(player_cards.hand).filter((card) => {
      return _.includes(_.words(card.types), 'action')
    }).map((card) => {
      let trashable_card = _.clone(card)
      trashable_card.source = 'H'
      return trashable_card
    }).value()

    let death_cart = _.find(player_cards.in_play, (card) => {
      return card.id === card_player.card.id
    })
    if (death_cart) {
      death_cart = _.clone(death_cart)
      death_cart.source = 'P'
      eligible_cards.push(death_cart)
    }

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to trash (or none to skip):',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(DeathCart.trash_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not trash a card`)
    }

  }

  static trash_card(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let source = selected_cards[0].source === 'H' ? 'hand' : 'in_play'
      let card_trasher = new CardTrasher(game, player_cards, source, selected_cards)
      let trashed_cards = card_trasher.trash()
      if (!_.isEmpty(trashed_cards)) {
        let coin_gainer = new CoinGainer(game, player_cards)
        coin_gainer.gain(5)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but does not trash a card`)
    }
  }

  gain_event(gainer) {
    _.times(2, () => {
      let card_gainer = new CardGainer(gainer.game, gainer.player_cards, 'discard', 'Ruins')
      card_gainer.gain()
    })
  }

}
