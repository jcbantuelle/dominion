WalledVillage = class WalledVillage extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(2)
  }

  start_cleanup_event(game, player_cards, walled_village) {
    actions_in_play = _.size(_.filter(player_cards.in_play, (card) => {
      return _.includes(_.words(card.types), 'action')
    }))
    if (actions_in_play < 3) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: `Put ${CardView.render(walled_village)} On Top of Deck?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, walled_village)
      turn_event_processor.process(WalledVillage.put_on_deck)
    }
  }

  static put_on_deck(game, player_cards, response, walled_village) {
    if (response === 'yes') {
      let card_mover = new CardMover(game, player_cards)
      if (card_mover.move(player_cards.in_play, player_cards.deck, walled_village)) {
        game.log.push(`<strong>${player_cards.username}</strong> puts ${CardView.render(walled_village)} on top of their deck`)
      }
    }
  }

}
