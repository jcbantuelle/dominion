Necromancer = class Necromancer extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let eligible_cards = _.filter(game.trash, (card) => {
      return !card.face_down && _.includes(_.words(card.types), 'action') && !_.includes(_.words(card.types), 'duration')
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
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card_player.card)
      turn_event_processor.process(Necromancer.play_from_trash)
    } else if (_.size(eligible_cards) === 1) {
      Necromancer.play_from_trash(game, player_cards, eligible_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to play`)
    }
  }

  static play_from_trash(game, player_cards, selected_cards, necromancer) {
    let trash_card = _.find(game.trash, function(card) {
      return card.id === selected_cards[0].id
    })
    trash_card.face_down = true

    let card_player = new CardPlayer(game, player_cards, selected_cards[0], necromancer)
    card_player.play(true, false)
  }

}
