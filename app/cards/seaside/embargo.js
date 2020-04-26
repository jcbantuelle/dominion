Embargo = class Embargo extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards, card_player) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2)

    let card_trasher = new CardTrasher(game, player_cards, 'in_play', card_player.card)
    let trashed_cards = card_trasher.trash()

    let trashed = _.find(trashed_cards, (card) => {
      return card.id === card_player.card.id
    })

    if (trashed) {
      GameModel.update(game._id, game)

      let eligible_cards = _.filter(game.cards, (card) => {
        return card.supply
      })

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: 'Choose a card to Embargo:',
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Embargo.place_token)
    }
  }

  buy_event(buyer) {
    _.times(buyer.game_card.embargos, () => {
      let card_gainer = new CardGainer(buyer.game, buyer.player_cards, 'discard', 'Curse')
      card_gainer.gain()
    })
  }

  static place_token(game, player_cards, selected_cards) {
    let embargo_card = _.find(game.cards, (card) => {
      return card.name === selected_cards[0].name
    })

    embargo_card.embargos += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts an embargo token on ${CardView.render(selected_cards[0])}`)
  }

}
