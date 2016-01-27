BandOfMisfits = class BandOfMisfits extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, player) {
    let all_player_cards = PlayerCardsModel.find(game._id)

    let self_cost = CostCalculator.calculate(game, player.card.to_h(player_cards), all_player_cards)

    let eligible_cards = _.filter(game.cards, function(card) {
      let coin_cost = CostCalculator.calculate(game, card.top_card, all_player_cards)
      return card.count > 0 && card.top_card.purchasable && coin_cost < self_cost && card.top_card.potion_cost === 0 && _.contains(_.words(card.top_card.types), 'action')
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: `Choose a card to play ${CardView.render(player.card.to_h(player_cards))} as:`,
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, player)
      turn_event_processor.process(BandOfMisfits.copy_card)

      let card_player = new CardPlayer(game, player_cards, player.card.name(), true)
      card_player.play()
      return card_player.play_response
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to copy`)
    }
  }

  static copy_card(game, player_cards, selected_cards, player) {
    let played_misfit_index = _.findIndex(player_cards.playing, function(card) {
      return card.name === player.card.name()
    })
    let misfit = player_cards.playing.splice(played_misfit_index, 1)[0]

    player.card = ClassCreator.create(selected_cards[0].name)
    let copy = player.card.to_h()
    copy.misfit = misfit
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> plays ${CardView.render(misfit)} as ${CardView.render(copy)}`)

    GameModel.update(game._id, game)

    player_cards.hand.push(copy)
  }

}
