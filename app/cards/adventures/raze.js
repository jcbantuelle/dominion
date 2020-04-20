Raze = class Raze extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards, card_player) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    let trashable_cards = _.map(player_cards.hand, function(card) {
      let new_card = _.clone(card)
      new_card.source = 'H'
      return new_card
    })
    let raze_in_play = _.find(player_cards.in_play, function(card) {
      return card.id === card_player.card.id
    })
    if (raze_in_play) {
      let raze = _.clone(raze_in_play)
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
    let source = trashed_card.source === 'H' ? 'hand' : 'in_play'
    let card_trasher = new CardTrasher(game, player_cards, source, trashed_card)
    card_trasher.trash()

    let coin_cost = CostCalculator.calculate(game, trashed_card)

    if (coin_cost > 0) {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(coin_cost, false)

      if (_.size(player_cards.revealed) > 1) {
        GameModel.update(game._id, game)
        PlayerCardsModel.update(game._id, player_cards)
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
    let card_mover = new CardMover(game, player_cards)
    card_mover.move(player_cards.revealed, player_cards.hand, selected_cards[0])
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts a card in their hand`)

    let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
    card_discarder.discard()
  }

}
