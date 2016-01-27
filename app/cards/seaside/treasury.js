Treasury = class Treasury extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    let gained_coins = CoinGainer.gain(game, player_cards, 1)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action and +$${gained_coins}`)
  }

  discard_event(discarder, card_name = 'Treasury') {
    let discard_card = this
    if (card_name === 'Estate') {
      discard_card = _.find(discarder.player_cards.discarding, function(card) {
        return card.name === 'Estate'
      })
    }
    let turn_event_id = TurnEventModel.insert({
      game_id: discarder.game._id,
      player_id: discarder.player_cards.player_id,
      username: discarder.player_cards.username,
      type: 'choose_yes_no',
      instructions: `Put ${CardView.render(discard_card)} On Top of Deck?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(discarder.game, discarder.player_cards, turn_event_id)
    turn_event_processor.process(Treasury.put_on_deck)
  }

  static put_on_deck(game, player_cards, response) {
    if (response === 'yes') {
      let treasury = player_cards.discarding.pop()
      game.log.push(`<strong>${player_cards.username}</strong> puts ${CardView.render(treasury)} on top of their deck`)
      delete treasury.scheme
      delete treasury.prince
      if (treasury.misfit) {
        treasury = treasury,misfit
      }
      player_cards.deck.unshift(treasury)
    }
  }

}
