Wish = class Wish extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 0
  }

  play(game, player_cards, card_player) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    let card_mover = new CardMover(game, player_cards)
    let return_count = card_mover.return_to_supply(player_cards.in_play, 'Wish', [card_player.card])

    if (return_count === 1) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> returns ${CardView.render(card_player.card)} to the ${CardView.render(card_player.card)} pile`)

      let eligible_cards = _.filter(game.cards, function(card) {
        return card.count > 0 && card.supply && CardCostComparer.coin_less_than(game, card.top_card, 7)
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
      } else if (_.size(eligible_cards) === 1) {
        Wish.gain_card(game, player_cards, eligible_cards)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but is unable to return it to its pile`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'hand', selected_cards[0].name)
    card_gainer.gain()
  }

}
