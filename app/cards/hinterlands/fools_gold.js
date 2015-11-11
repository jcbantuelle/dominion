FoolsGold = class FoolsGold extends Card {

  types() {
    return ['treasure', 'reaction']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    if (game.turn.fools_gold) {
      game.turn.coins += 4
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$4`)
    } else {
      game.turn.fools_gold = true
      game.turn.coins += 1
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$1`)
    }
  }

  gain_reaction(game, player_cards) {
    let turn_event_id = TurnEvents.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_yes_no',
      instructions: `Trash ${CardView.render(this)} to gain a ${CardView.card_html('treasure', 'Gold')}?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(FoolsGold.trash_for_gold)
  }

  static trash_for_gold(game, player_cards, response) {
    if (response === 'yes') {
      let card_trasher = new CardTrasher(game, player_cards.username, player_cards.hand, 'Fools Gold')
      card_trasher.trash()

      let original_deck_size = _.size(player_cards.deck)
      let card_gainer = new CardGainer(game, player_cards, 'deck', 'Gold')
      card_gainer.gain_game_card()
      if (_.size(player_cards.deck) > original_deck_size) {
        game.log.push(`&nbsp;&nbsp;putting it on top of their deck`)
      }
    }
  }

}
