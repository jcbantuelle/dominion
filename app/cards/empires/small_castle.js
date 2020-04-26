SmallCastle = class SmallCastle extends Castles {

  types() {
    return ['action', 'victory', 'castle']
  }

  victory_points(player_cards) {
    return 2
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let castles = _.filter(player_cards.hand, function(card) {
      return _.includes(_.words(card.types), 'castle')
    })
    let trashable_cards = _.map(castles, function(card) {
      let new_card = _.clone(card)
      new_card.source = 'H'
      return new_card
    })
    let small_castle_in_play = _.find(player_cards.in_play, function(card) {
      return card.id === card_player.card.id
    })
    if (small_castle_in_play) {
      let small_castle = _.clone(small_castle_in_play)
      small_castle.source = 'P'
      trashable_cards.push(small_castle)
    }

    if (_.size(trashable_cards) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a castle to trash:',
        cards: trashable_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(SmallCastle.trash_card)
    } else if (_.size(trashable_cards) === 1) {
      SmallCastle.trash_card(game, player_cards, trashable_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no castles to trash`)    }

  }

  static trash_card(game, player_cards, selected_cards) {
    let source = selected_cards[0].source === 'H' ? 'hand' : 'in_play'

    let card_trasher = new CardTrasher(game, player_cards, source, selected_cards)
    let trashed_cards = card_trasher.trash()
    if (_.size(trashed_cards) > 0) {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Castles')
      card_gainer.gain()
    }
  }

}
