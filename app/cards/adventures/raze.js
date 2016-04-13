Raze = class Raze extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards, player) {
    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    let trashable_cards = _.map(player_cards.hand, function(card) {
      let new_card = _.clone(card)
      new_card.source = 'H'
      return new_card
    })
    let raze_in_play = _.some(player_cards.playing, function(card) {
      return card.name === player.card.name()
    })
    if (raze_in_play) {
      let raze = player.card.to_h(player_cards)
      raze.source = 'P'
      trashable_cards.push(raze)
    }

    if (_.size(trashable_cards) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to trash:',
        cards: trashable_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Raze.trash_card)
    } else if (_.size(trashable_cards) === 1) {
      Raze.trash_card(game, player_cards, trashable_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards to trash`)
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    let trashed_card = selected_cards[0]
    let source = trashed_card.source === 'H' ? 'hand' : 'playing'
    let card_trasher = new CardTrasher(game, player_cards, source, trashed_card.name)
    card_trasher.trash()

    let coin_cost = CostCalculator.calculate(game, trashed_card)

    if (coin_cost > 0) {
      player_cards.revealed = _.take(player_cards.deck, coin_cost)
      player_cards.deck = _.drop(player_cards.deck, coin_cost)

      let revealed_card_count = _.size(player_cards.revealed)
      if (revealed_card_count < coin_cost && _.size(player_cards.discard) > 0) {
        DeckShuffler.shuffle(game, player_cards)
        player_cards.revealed = player_cards.revealed.concat(_.take(player_cards.deck, coin_cost - revealed_card_count))
        player_cards.deck = _.drop(player_cards.deck, coin_cost - revealed_card_count)
      }

      if (_.size(player_cards.revealed) > 1) {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> looks at the top ${_.size(player_cards.revealed)} cards of their deck`)
        GameModel.update(game._id, game)
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose a card to put in hand:',
          cards: player_cards.revealed,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Raze.put_card_in_hand)
      } else if (_.size(player_cards.revealed) === 1) {
        Raze.put_card_in_hand(game, player_cards, player_cards.revealed)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no cards in deck`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but the coin cost is 0`)
    }
  }

  static put_card_in_hand(game, player_cards, selected_cards) {
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts a card in their hand`)
    let selected_card_index = _.findIndex(player_cards.revealed, function(card) {
      return card.name === selected_cards[0].name
    })
    player_cards.hand.push(player_cards.revealed.splice(selected_card_index, 1)[0])
    let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
    card_discarder.discard()
  }

}
