Necromancer = class Necromancer extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let eligible_cards = _.filter(game.trash, function(card) {
      let card_types = _.words(card.types)
      return !card.face_down && _.includes(card_types, 'action') && !_.includes(card_types, 'duration')
    })

    if (_.size(eligible_cards) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        game_cards: false,
        instructions: 'Choose a card to play:',
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Necromancer.play_from_trash)
    } else if (_.size(eligible_cards) === 1) {
      Necromancer.play_from_trash(game, player_cards, eligible_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to play`)
    }
  }

  static play_from_trash(game, player_cards, selected_cards) {
    let trash_card_index = _.findIndex(game.trash, function(card) {
      return card.name === selected_cards[0].name
    })
    game.trash[trash_card_index].face_down = true

    let trash_card_player = new TrashCardPlayer(game, player_cards, game.trash[trash_card_index].id)
    trash_card_player.play()
  }

}
