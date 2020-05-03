Pursue = class Pursue extends Event {

  coin_cost() {
    return 2
  }

  buy(game, player_cards) {
    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    if (_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) {
      GameModel.update(game._id, game)

      let unique_cards = _.uniqBy(AllPlayerCardsQuery.find(player_cards), 'name')

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Name a card: (or none to skip)',
        cards: unique_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      let named_card = turn_event_processor.process(Pursue.name_card)

      if (!_.isEmpty(named_card)) {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> names ${CardView.render(named_card)}`)
      } else {
        game.log.push(`&nbsp;&nbsp;but chooses not to name a card`)
      }

      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(4)

      var matches
      if (!_.isEmpty(named_card)) {
        matches = _.filter(player_cards.revealed, (card) => {
          return card.name === named_card[0].name
        })  
      }

      if (!_.isEmpty(matches)) {
        GameModel.update(game._id, game)
        PlayerCardsModel.update(game._id, player_cards)

        let card_returner = new CardReturner(game, player_cards)
        card_returner.return_to_deck(player_cards.revealed, matches)
      }

      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard()
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in deck to reveal`)
    }
  }

  static name_card(game, player_cards, selected_cards) {
    return selected_cards
  }

}
