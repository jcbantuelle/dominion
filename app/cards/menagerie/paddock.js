Paddock = class Paddock extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2)
    
    _.times(2, function() {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Horse')
      card_gainer.gain()
    })

    let empty_pile_count = _.size(_.filter(game.cards, function(game_card) {
      return game_card.count === 0 && game_card.supply
    }))

    if (empty_pile_count > 0) {
      let action_gainer = new ActionGainer(game, player_cards)
      action_gainer.gain(empty_pile_count)
    }
  }

  play_card_event(card_player, kiln) {
    card_player.game.turn.kiln = false
    let turn_event_id = TurnEventModel.insert({
      game_id: card_player.game._id,
      player_id: card_player.player_cards.player_id,
      username: card_player.player_cards.username,
      type: 'choose_yes_no',
      instructions: `Gain a copy of ${CardView.render(card_player.card)}?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(card_player.game, card_player.player_cards, turn_event_id)
    let response = turn_event_processor.process(Kiln.gain_copy)

    if (response === 'yes') {
      let card_gainer = new CardGainer(card_player.game, card_player.player_cards, 'discard', card_player.card.name)
      card_gainer.gain()
    } else {
      card_player.game.log.push(`&nbsp;&nbsp;but chooses not to gain a copy of it`)
    }
  }

  static gain_copy(game, player_cards, response) {
    return response
  }

}
