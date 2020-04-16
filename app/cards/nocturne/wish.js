Wish = class Wish extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 0
  }

  play(game, player_cards, player) {
    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    let wish_index = _.findIndex(player_cards.playing, function(card) {
      return card.id === player.played_card.id
    })

    if (wish_index !== -1) {

      let wish_pile = _.find(game.cards, function(card) {
        return card.name === 'Wish'
      })

      let wish_card = player_cards.playing.splice(wish_index, 1)[0]

      wish_pile.count += 1
      wish_pile.stack.unshift(wish_card)
      wish_pile.top_card = _.head(wish_pile.stack)

      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> returns ${CardView.render(this)} to the Wish pile`)

      let eligible_cards = _.filter(game.cards, function(card) {
        return card.count > 0 && card.top_card.purchasable && CardCostComparer.coin_less_than(game, card.top_card, 7)
      })

      if (_.size(eligible_cards) > 0) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          game_cards: true,
          instructions: 'Choose a card to gain:',
          cards: eligible_cards,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Wish.gain_card)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
      }
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    let card_gainer = new CardGainer(game, player_cards, 'hand', selected_card.name)
    card_gainer.gain()
  }

}
