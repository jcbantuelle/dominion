HornOfPlenty = class HornOfPlenty extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let unique_cards = _.uniq(player_cards.in_play.concat(player_cards.playing), function(card) {
      return card.name
    })

    let all_player_cards = PlayerCardsModel.find(game._id)

    let eligible_cards = _.filter(game.cards, function(card) {
      let coin_cost = CostCalculator.calculate(game, card.top_card, all_player_cards)
      return card.count > 0 && card.top_card.purchasable && coin_cost <= _.size(unique_cards) && card.top_card.potion_cost === 0
    })

    if (_.size(eligible_cards) > 0) {
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
      turn_event_processor.process(HornOfPlenty.gain_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    let gained_card = _.clone(selected_card.top_card)
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_card.name)
    card_gainer.gain_game_card()

    if (_.includes(_.words(gained_card.types), 'victory')) {
      let card_trasher = new CardTrasher(game, player_cards, 'playing', 'Horn Of Plenty')
      card_trasher.trash()
    }
  }

}
