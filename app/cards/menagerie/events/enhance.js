Enhance = class Enhance extends Event {

  coin_cost() {
    return 3
  }

  buy(game, player_cards) {
    let eligible_cards = _.filter(player_cards.hand, (card) => {
      return !_.includes(_.words(card.types), 'victory')
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to trash: (or none to skip)',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      let trashed_card = turn_event_processor.process(Enhance.trash_card)

      if (!_.isEmpty(trashed_card)) {
        let eligible_cards = _.filter(game.cards, function(card) {
          return card.count > 0 && card.supply && CardCostComparer.card_less_than(game, trashed_card[0], card.top_card, 3)
        })

        let card_trasher = new CardTrasher(game, player_cards, 'hand', trashed_card)
        card_trasher.trash()

        if (_.size(eligible_cards) > 1) {
          GameModel.update(game._id, game)
          PlayerCardsModel.update(game._id, player_cards)
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
          turn_event_processor.process(Enhance.gain_card)
        } else if (_.size(eligible_cards) === 1) {
          Enhance.gain_card(game, player_cards, eligible_cards)
        } else {
          game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
        }
      } else {
        game.log.push(`&nbsp;&nbsp;but chooses not to trash a card`)  
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to trash a card`)
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    return selected_cards
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain()
  }

}
