Ironmonger = class Ironmonger extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    GameModel.update(game._id, game)
    PlayerCardsModel.update(game._id, player_cards)

    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(1)

      let revealed_card_types = _.words(player_cards.revealed[0].types)

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: game.turn.player._id,
        username: game.turn.player.username,
        type: 'choose_yes_no',
        instructions: `Discard ${CardView.render(player_cards.revealed)}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Ironmonger.discard_card)

      if (_.includes(revealed_card_types, 'action')) {
        let action_gainer = new ActionGainer(game, player_cards)
        action_gainer.gain(1)
      }
      if (_.includes(revealed_card_types, 'treasure')) {
        let coin_gainer = new CoinGainer(game, player_cards, card_player)
        coin_gainer.gain(1)
      }
      if (_.includes(revealed_card_types, 'victory')) {
        let card_drawer = new CardDrawer(game, player_cards, card_player)
        card_drawer.draw(1)
      }
    }
  }

  static discard_card(game, player_cards, response) {
    if (response === 'yes') {
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard()
    } else {
      let card_returner = new CardReturner(game, player_cards)
      card_returner.return_to_deck(player_cards.revealed)
    }
  }

}
