Overlord = class Overlord extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 0
  }

  debt_cost() {
    return 8
  }

  play(game, player_cards, player) {
    let eligible_cards = _.filter(game.cards, function(card) {
      return card.count > 0 && card.top_card.purchasable && _.includes(_.words(card.top_card.types), 'action') && CardCostComparer.coin_less_than(game, card.top_card, 6)
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
      turn_event_processor.process(Overlord.copy_card)

      let card_player = new CardPlayer(game, player_cards, player.card_id, true, true)
      card_player.play()
      return card_player.play_response
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to copy`)
    }
  }

  static copy_card(game, player_cards, selected_cards, player) {
    let played_overlord_index = _.findIndex(player_cards.playing, function(card) {
      return card.id === player.played_card.id
    })
    let overlord = player_cards.playing.splice(played_overlord_index, 1)[0]

    player.card = ClassCreator.create(selected_cards[0].name)
    let copy = player.card.to_h()
    copy.misfit = overlord
    copy.id = overlord.id
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> plays ${CardView.render(overlord)} as ${CardView.render(copy)}`)

    GameModel.update(game._id, game)

    player_cards.hand.push(copy)
  }

}
