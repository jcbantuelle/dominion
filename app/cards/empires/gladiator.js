Gladiator = class Gladiator extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  stack_name() {
    return 'Gladiator/Fortune'
  }

  play(game, player_cards) {
    let gained_coins = CoinGainer.gain(game, player_cards, 2)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)

    if (_.size(player_cards.hand) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to reveal:',
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Gladiator.reveal_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but <strong>${player_cards.username}</strong> has no cards in hand`)
    }
  }

  static reveal_card(game, player_cards, revealed_card) {
    revealed_card = revealed_card[0]

    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(revealed_card)}`)

    let next_player_query = new NextPlayerQuery(game, player_cards.player_id)
    let next_player_cards = PlayerCardsModel.findOne(game._id, next_player_query.next_player()._id)

    let revealed_copy = _.find(next_player_cards.hand, function(card) {
      return card.name === revealed_card.name
    })
    if (revealed_copy) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: next_player_cards.player_id,
        username: next_player_cards.username,
        type: 'choose_yes_no',
        instructions: `Reveal ${CardView.render(revealed_copy)}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, next_player_cards, turn_event_id, player_cards)
      turn_event_processor.process(Gladiator.reveal_copy)
    } else {
      Gladiator.reveal_copy(game, next_player_cards, 'no', player_cards)
    }
  }

  static reveal_copy(game, next_player_cards, response, player_cards) {
    if (response === 'yes') {
      game.log.push(`&nbsp;&nbsp;<strong>${next_player_cards.username}</strong> reveals a copy`)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${next_player_cards.username}</strong> does not reveal a copy`)

      let gained_coins = CoinGainer.gain(game, player_cards, 1)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)

      let gladiator_index = _.findIndex(game.cards, (card) => {
        return card.stack_name === 'Gladiator/Fortune'
      })
      if (gladiator_index != -1 && game.cards[gladiator_index].top_card.name === 'Gladiator') {
        game.trash.push(game.cards[gladiator_index].top_card)
        game.cards[gladiator_index].stack.shift()
        game.cards[gladiator_index].count -= 1
        if (game.cards[gladiator_index].count > 0) {
          game.cards[gladiator_index].top_card = _.head(game.cards[gladiator_index].stack)
        }
        game.log.push(`&nbsp;&nbsp;${CardView.card_html('action', 'Gladiator')} is trashed from the supply`)
      } else {
        game.log.push(`&nbsp;&nbsp;but there is no ${CardView.card_html('action', 'Gladiator')} to trash`)
      }
    }
  }

}
