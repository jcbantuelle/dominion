Herbalist = class Herbalist extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    game.turn.buys += 1
    let gained_coins = CoinGainer.gain(game, player_cards, 1)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy and +$${gained_coins}`)
  }

  discard_event(discarder) {
    let treasures = _.filter(discarder.player_cards.to_discard, function(card) {
      return _.includes(_.words(card.types), 'treasure')
    })
    let turn_event_id = TurnEventModel.insert({
      game_id: discarder.game._id,
      player_id: discarder.player_cards.player_id,
      username: discarder.player_cards.username,
      type: 'choose_cards',
      player_cards: true,
      instructions: 'Choose a treasure to put on your deck (Or none to skip):',
      cards: treasures,
      minimum: 0,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(discarder.game, discarder.player_cards, turn_event_id)
    turn_event_processor.process(Herbalist.put_on_deck)
  }

  static put_on_deck(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let card_index = _.findIndex(player_cards.to_discard, function(card) {
        return card.id === selected_cards[0].id
      })

      let card = player_cards.to_discard.splice(card_index, 1)[0]
      delete card.scheme
      delete card.prince
      if (card.misfit) {
        card = card.misfit
      }
      player_cards.deck.unshift(card)
      game.log.push(`<strong>${player_cards.username}</strong> puts ${CardView.render(card)} on top of their deck`)
    }
  }

}
