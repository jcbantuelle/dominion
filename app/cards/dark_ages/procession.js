Procession = class Procession extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let eligible_cards = _.filter(player_cards.hand, function(card) {
      return _.contains(_.words(card.types), 'action')
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to play two times: (Or none to skip)',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Procession.play_twice)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no action cards in hand`)
    }
  }

  static play_twice(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let selected_card = selected_cards[0]

      let repeat_card_player = new RepeatCardPlayer(game, player_cards, selected_card.name)
      repeat_card_player.play(2, 'Procession')

      let played_card_index = _.findIndex(player_cards.playing, function(card) {
        return card.name == repeat_card_player.card.name()
      })
      if (played_card_index !== -1) {
        let card_trasher = new CardTrasher(game, player_cards, 'playing', repeat_card_player.card.name())
        card_trasher.trash()
      }

      let all_player_cards = PlayerCardsModel.find(game._id)
      let selected_card_coin_cost = CostCalculator.calculate(game, selected_card, all_player_cards)

      let eligible_cards = _.filter(game.cards, function(card) {
        let game_card_coin_cost = CostCalculator.calculate(game, card.top_card, all_player_cards)
        return card.count > 0 && card.top_card.purchasable && _.contains(_.words(card.top_card.types), 'action') && game_card_coin_cost === (selected_card_coin_cost + 1) && card.top_card.potion_cost === selected_card.potion_cost
      })

      if (_.size(eligible_cards) > 0) {
        GameModel.update(game._id, game)
        PlayerCardsModel.update(game._id, player_cards)
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
        turn_event_processor.process(Procession.gain_card)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no available actions to gain`)
      }
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain_game_card()
  }

}
