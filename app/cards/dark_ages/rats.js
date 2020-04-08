Rats = class Rats extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Rats')
    card_gainer.gain_game_card()

    PlayerCardsModel.update(game._id, player_cards)

    let eligible_cards = _.filter(player_cards.hand, function(card) {
      return card.name !== 'Rats'
    })

    if (_.size(eligible_cards) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to trash:',
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Rats.trash_card)
    } else if (_.size(eligible_cards) === 1) {
      Rats.trash_card(game, player_cards, eligible_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.hand)}`)
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
    card_trasher.trash()
  }

  trash_event(trasher) {
    let card_drawer = new CardDrawer(trasher.game, trasher.player_cards)
    card_drawer.draw(1)
  }

}
