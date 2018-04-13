Locusts = class Locusts extends Hex {

  receive(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      if (_.size(player_cards.deck) === 0) {
        DeckShuffler.shuffle(game, player_cards)
      }

      let top_card = player_cards.deck.shift()
      player_cards.revealed.push(top_card)

      let card_trasher = new CardTrasher(game, player_cards, 'revealed', top_card.name)
      card_trasher.trash()

      if (_.includes(['Copper', 'Estate'], top_card.name)) {
        let card_gainer = new CardGainer(game, player_cards, 'discard', 'Curse')
        card_gainer.gain_game_card()
      } else {
        GameModel.update(game._id, game)
        let eligible_cards = _.filter(game.cards, function(card) {
          let intersecting_types = _.intersection(_.words(card.top_card.types), _.words(top_card.types))
          return card.count > 0 && card.top_card.purchasable && !_.isEmpty(intersecting_types) && CardCostComparer.card_less_than(game, top_card, card.top_card)
        })

        if (_.size(eligible_cards) > 0) {
          let turn_event_id = TurnEventModel.insert({
            game_id: game._id,
            player_id: player_cards.player_id,
            username: player_cards.username,
            type: 'choose_cards',
            game_cards: true,
            instructions: `Choose a card to gain:`,
            cards: eligible_cards,
            minimum: 1,
            maximum: 1
          })
          let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
          turn_event_processor.process(Locusts.gain_card)
        } else {
          game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
        }
      }
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain_game_card()
  }


}
