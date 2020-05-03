Sacrifice = class Sacrifice extends Card {

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
    if (_.size(player_cards.hand) > 1) {
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
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card_player)
      turn_event_processor.process(Sacrifice.trash_card)
    } else if (_.size(player_cards.hand) === 1) {
      Sacrifice.trash_card(game, player_cards, player_cards.hand, card_player)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static trash_card(game, player_cards, selected_cards, card_player) {
    let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
    let trashed_card = card_trasher.trash()[0]

    if (trashed_card) {
      let selected_card_types = _.words(trashed_card.types)

      if (_.includes(selected_card_types, 'action')) {
        let card_drawer = new CardDrawer(game, player_cards, card_player)
        card_drawer.draw(2)

        let action_gainer = new ActionGainer(game, player_cards)
        action_gainer.gain(2)
      }

      if (_.includes(selected_card_types, 'treasure')) {
        let coin_gainer = new CoinGainer(game, player_cards, card_player)
        coin_gainer.gain(2)
      }

      if (_.includes(selected_card_types, 'victory')) {
        let victory_token_gainer = new VictoryTokenGainer(game, player_cards)
        victory_token_gainer.gain(2)
      }
    }
  }

}
