HorseTraders = class HorseTraders extends Card {

  types() {
    return this.capitalism_types(['action', 'reaction'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(3)

    if (_.size(player_cards.hand) > 2) {
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Discard 2 cards:',
        cards: player_cards.hand,
        minimum: 2,
        maximum: 2
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(HorseTraders.discard_cards)
    } else if (_.size(player_cards.hand) === 0) {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    } else {
      let card_discarder = new CardDiscarder(game, player_cards, player_cards.hand)
      card_discarder.discard()
    }
  }

  static discard_cards(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
    card_discarder.discard()
  }

  attack_event(game, player_cards, horse_traders) {
    let card_mover = new CardMover(game, player_cards)
    card_mover.move(player_cards.hand, player_cards.aside, horse_traders)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside ${CardView.render(horse_traders)}`)
  }

  start_turn_event(game, player_cards, horse_traders) {
    let card_drawer = new CardDrawer(game, player_cards, horse_traders)
    card_drawer.draw(1)

    let card_mover = new CardMover(game, player_cards)
    card_mover.move(player_cards.aside, player_cards.hand, horse_traders)

    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> returns ${CardView.render(horse_traders)} to their hand`)
  }

}
