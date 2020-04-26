Bat = class Bat extends Card {

  types() {
    return ['night']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards, card_player) {
    if (_.size(player_cards.hand) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose up to 2 cards to trash:',
        cards: player_cards.hand,
        minimum: 0,
        maximum: 2
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      let trashed_cards = turn_event_processor.process(Bat.trash_cards)

      if (trashed_cards && _.size(trashed_cards) > 0) {
        let bat_in_play = _.find(player_cards.in_play, (card) => {
          return card.id === card_player.card.id
        })
        if (bat_in_play) {
          let vampire_stack = _.find(game.cards, (card) => {
            return card.name === 'Vampire'
          })
          if (vampire_stack && vampire_stack.count > 0) {
            let card_mover = new CardMover(game, player_cards)
            if (card_mover.return_to_supply(player_cards.in_play, 'Bat', [card_player.card])) {
              card_mover.take_from_supply(player_cards.discard, vampire_stack.top_card)
              game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> exchanges ${CardView.render(card_player.card)} for ${CardView.render(vampire_stack.top_card)}`)
            }
          } else {
            game.log.push(`&nbsp;&nbsp;but there is no ${CardView.render(new Vampire())} to exchange with ${CardView.render(card_player.card)}`)
          }
        } else {
          game.log.push(`&nbsp;&nbsp;but cannot exhange ${CardView.render(card_player.card)} because it is no longer in play`)
        }
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but has no cards in hand`)
    }
  }

  static trash_cards(game, player_cards, selected_cards) {
    if (_.size(selected_cards) > 0) {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
      return card_trasher.trash()
    } else {
      game.log.push(`&nbsp;&nbsp;but does not trash anything`)
    }
  }

}
