TravellingFair = class TravellingFair extends Event {

  coin_cost() {
    return 2
  }

  buy(game, player_cards) {
    game.turn.buys += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 buys`)

    game.turn.travelling_fair = true
  }

  gain_event(gainer, travelling_fair) {
    let turn_event_id = TurnEventModel.insert({
      game_id: this.game._id,
      player_id: this.player_cards.player_id,
      username: this.player_cards.username,
      type: 'choose_yes_no',
      instructions: `Put ${CardView.render(gained_card)} on top of your deck?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id, this)
    turn_event_processor.process(CardGainer.put_card_on_deck)
  }

  static put_card_on_deck(game, player_cards, response, gainer) {
    if (response === 'yes') {
      gainer.destination = 'deck'
    }
  }
}
