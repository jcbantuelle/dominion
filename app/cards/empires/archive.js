Archive = class Archive extends Duration {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    if (_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(3, false)

      let card_text = _.size(player_cards.revealed) === 1 ? 'card' : 'cards'
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside the top ${_.size(player_cards.revealed)} ${card_text} of their deck`)

      let archive_effect = _.clone(card_player.card)
      archive_effect.archive_cards = _.clone(player_cards.revealed)

      let card_mover = new CardMover(game, player_cards)
      card_mover.move_all(player_cards.revealed, player_cards.archive)

      this.duration(game, player_cards, archive_effect)

      if (!_.isEmpty(archive_effect.archive_cards)) {
        return 'duration'
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in deck`)
    }
  }

  duration(game, player_cards, archive) {
    if (_.size(archive.archive_cards) > 1) {
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to put in hand:',
        cards: archive.archive_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, archive)
      turn_event_processor.process(Archive.put_card_in_hand)
    } else {
      Archive.put_card_in_hand(game, player_cards, archive.archive_cards, archive)
    }
  }

  static put_card_in_hand(game, player_cards, selected_cards, archive) {
    let card_mover = new CardMover(game, player_cards)
    card_mover.move(player_cards.archive, player_cards.hand, selected_cards[0])
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts a set aside card in hand from ${CardView.render(archive)}`)

    let aside_card_index = _.findIndex(archive.archive_cards, function(card) {
      return selected_cards[0].id === card.id
    })
    archive.archive_cards.splice(aside_card_index, 1)
    if (_.size(archive.archive_cards) > 0) {
      player_cards.duration_effects.push(archive)
    }
  }

}
