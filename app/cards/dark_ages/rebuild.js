Rebuild = class Rebuild extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    if (_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) {
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)

      let unique_victory_cards = _.filter(_.uniqBy(AllPlayerCardsQuery.find(player_cards), 'name'), (card) => {
        return _.includes(_.words(card.types), 'victory')
      })

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Name a card: (or none to target all victory cards)',
        cards: unique_victory_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Rebuild.reveal_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in deck to reveal`)
    }
  }

  static reveal_card(game, player_cards, selected_cards) {
    let named_card
    if (!_.isEmpty(selected_cards)) {
      named_card = selected_cards[0].name
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> names ${CardView.render(selected_cards)}`)
    } else {
      named_card = ''
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> does not name a card`)
    }

    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal_from_deck_until((game, player_cards, revealed_cards, named_card) => {
      if (!_.isEmpty(revealed_cards)) {
        let revealed_card = _.last(revealed_cards)
        return _.includes(_.words(revealed_card.types), 'victory') && revealed_card.name !== named_card
      } else {
        return false
      }
    }, true, named_card)

    let non_target_cards = _.filter(player_cards.revealed, (card) => {
      return !_.includes(_.words(card.types), 'victory') || card.name === named_card
    })
    let card_discarder = new CardDiscarder(game, player_cards, 'revealed', non_target_cards)
    card_discarder.discard()

    if (!_.isEmpty(player_cards.revealed)) {
      let eligible_cards = _.filter(game.cards, function(card) {
        return card.count > 0 && card.supply && _.includes(_.words(card.top_card.types), 'victory') && CardCostComparer.card_less_than(game, player_cards.revealed[0], card.top_card, 4)
      })

      let card_trasher = new CardTrasher(game, player_cards, 'revealed', player_cards.revealed[0])
      card_trasher.trash()

      if (_.size(eligible_cards) > 0) {
        GameModel.update(game._id, game)
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          game_cards: true,
          instructions: 'Choose a victory card to gain:',
          cards: eligible_cards,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Rebuild.gain_card)
      } else if (_.size(eligible_cards) === 1) {
        Rebuild.gain_card(game, player_cards, eligible_cards)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no available victory cards to gain`)
      }
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain()
  }

}
