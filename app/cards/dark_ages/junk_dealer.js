JunkDealer = class JunkDealer extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    let gained_coins = CoinGainer.gain(game, player_cards, 1)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action and +$${gained_coins}`)

    if (_.size(player_cards.hand) > 1) {
      PlayerCardsModel.update(game._id, player_cards)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to trash:',
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(JunkDealer.trash_card)
    } else if (_.size(player_cards.hand) === 1) {
      JunkDealer.trash_card(player_cards.hand)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards[0].name)
    card_trasher.trash()
  }

}
