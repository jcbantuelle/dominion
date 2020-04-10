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

  discard_event(discarder, treasury) {
    let turn_event_id = TurnEventModel.insert({
      game_id: discarder.game._id,
      player_id: discarder.player_cards.player_id,
      username: discarder.player_cards.username,
      type: 'choose_yes_no',
      instructions: `Put ${CardView.render(treasury)} On Top of Deck?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(discarder.game, discarder.player_cards, turn_event_id, treasury)
    turn_event_processor.process(Treasury.put_on_deck)
  }

  static put_on_deck(game, player_cards, response, treasury) {
    if (response === 'yes') {
      let treasury_index = _.findIndex(player_cards.discarding, (card) => {
        card.id === treasury.id
      })
      let treasury = player_cards.discarding.splice(treasury_index, 1)[0]
      game.log.push(`<strong>${player_cards.username}</strong> puts ${CardView.render(treasury)} on top of their deck`)
      delete treasury.scheme
      delete treasury.prince
      if (treasury.misfit) {
        treasury = treasury.misfit
      }
      player_cards.deck.unshift(treasury)
    }
  }

}
