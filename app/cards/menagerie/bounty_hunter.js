BountyHunter = class BountyHunter extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards, card_player) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    if (_.size(player_cards.hand) > 1) {
      GameModel.update(game._id, game)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to exile:',
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card_player)
      turn_event_processor.process(BountyHunter.exile_card)
    } else if (_.size(player_cards.hand) === 1) {
      BountyHunter.exile_card(game, player_cards, player_cards.hand)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static exile_card(game, player_cards, selected_cards, card_player) {
    let exiled_copy = _.find(player_cards.exile, (card) => {
      return selected_cards[0].name === card.name
    })

    let card_mover = new CardMover(game, player_cards)
    card_mover.move(player_cards.hand, player_cards.exile, selected_cards[0])
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> exiles ${CardView.render(selected_cards)}`)

    if (!exiled_copy) {
      let coin_gainer = new CoinGainer(game, player_cards, card_player)
      coin_gainer.gain(3)
    }
  }

}
