Alchemist = class Alchemist extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  potion_cost() {
    return 1
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(2)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)
  }

  discard_event(discarder, alchemist) {
    let has_potions = _.some(discarder.player_cards.in_play, (card) => {
      return card.name === 'Potion'
    })
    if (has_potions) {
      let turn_event_id = TurnEventModel.insert({
        game_id: discarder.game._id,
        player_id: discarder.player_cards.player_id,
        username: discarder.player_cards.username,
        type: 'choose_yes_no',
        instructions: `Put ${CardView.render(alchemist)} On Top of Deck?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(discarder.game, discarder.player_cards, turn_event_id, alchemist)
      turn_event_processor.process(Alchemist.put_on_deck)
    }
  }

  static put_on_deck(game, player_cards, response, alchemist) {
    if (response === 'yes') {
      let card_mover = new CardMover(game, player_cards)
      if (card_mover.move(player_cards.in_play, player_cards.deck, alchemist)) {
        game.log.push(`<strong>${player_cards.username}</strong> puts ${CardView.render(alchemist)} on top of their deck`)
      }
    }
  }

}
