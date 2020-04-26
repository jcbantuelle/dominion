Pooka = class Pooka extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let eligible_cards = _.filter(player_cards.hand, (card) => {
      return _.includes(_.words(card.types), 'treasure') && card.name !== 'Cursed Gold'
    })
    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a treasure to trash: (or none to skip)',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Pooka.trash_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not trash anything`)
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards[0])
      card_trasher.trash()

      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(4)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not trash anything`)
    }
  }

}
