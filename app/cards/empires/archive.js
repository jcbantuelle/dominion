Archive = class Archive extends Card {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    if (_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) {
      let revealed_cards = _.take(player_cards.deck, 3)
      player_cards.deck = _.drop(player_cards.deck, 3)

      let revealed_card_count = _.size(revealed_cards)
      if (revealed_card_count < 3 && _.size(player_cards.discard) > 0) {
        DeckShuffler.shuffle(game, player_cards)
        revealed_cards = revealed_cards.concat(_.take(player_cards.deck, 3 - revealed_card_count))
        player_cards.deck = _.drop(player_cards.deck, 3 - revealed_card_count)
      }
      revealed_card_count = _.size(revealed_cards)

      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside the top ${_.size(revealed_cards)} cards of their deck`)
      player_cards.archive = player_cards.archive.concat(revealed_cards)

      let archive_effect = this.to_h()
      archive_effect.set_aside_cards = revealed_cards
      this.duration(game, player_cards, archive_effect)

      if (revealed_card_count > 1) {
        return 'duration'
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in deck`)
    }
  }

  duration(game, player_cards, duration_card) {
    if (_.size(duration_card.set_aside_cards) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to put in hand:',
        cards: duration_card.set_aside_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, duration_card)
      turn_event_processor.process(Archive.put_card_in_hand)
    } else {
      Archive.put_card_in_hand(game, player_cards, duration_card.set_aside_cards, duration_card)
    }
  }

  static put_card_in_hand(game, player_cards, selected_card, duration_card) {
    selected_card = selected_card[0]
    let selected_card_index = _.findIndex(player_cards.archive, function(card) {
      return selected_card.name === card.name
    })
    player_cards.hand.push(player_cards.archive.splice(selected_card_index, 1)[0])
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts a set aside card in hand from ${CardView.card_html('duration', 'Archive')}`)

    let duration_card_index = _.findIndex(duration_card.set_aside_cards, function(card) {
      return selected_card.name === card.name
    })
    duration_card.set_aside_cards.splice(duration_card_index, 1)
    if (_.size(duration_card.set_aside_cards) > 0) {
      player_cards.duration_effects.push(duration_card)
    }
  }

}
