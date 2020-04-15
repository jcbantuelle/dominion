Herbalist = class Herbalist extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(1)
  }

  discard_event(discarder, herbalist) {
    let treasures = _.filter(discarder.player_cards.in_play, function(card) {
      return _.includes(_.words(card.types), 'treasure')
    })
    let turn_event_id = TurnEventModel.insert({
      game_id: discarder.game._id,
      player_id: discarder.player_cards.player_id,
      username: discarder.player_cards.username,
      type: 'choose_cards',
      player_cards: true,
      instructions: 'Choose a treasure to put on your deck (or none to skip):',
      cards: treasures,
      minimum: 0,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(discarder.game, discarder.player_cards, turn_event_id)
    turn_event_processor.process(Herbalist.put_on_deck)
  }

  static put_on_deck(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let card_mover = new CardMover(game, player_cards)
      if (card_mover.move(player_cards.in_play, player_cards.deck, selected_cards[0])) {
        game.log.push(`<strong>${player_cards.username}</strong> puts ${CardView.render(selected_cards)} on top of their deck`)
      }
    }
  }

}
