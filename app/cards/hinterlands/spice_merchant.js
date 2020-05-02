SpiceMerchant = class SpiceMerchant extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let eligible_cards = _.filter(player_cards.hand, function(card) {
      return _.includes(_.words(card.types), 'treasure')
    })
    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a treasure to trash (or none to skip):',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card_player)
      turn_event_processor.process(SpiceMerchant.trash_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not trash anything`)
    }
  }

  static trash_card(game, player_cards, selected_cards, card_player) {
    if (!_.isEmpty(selected_cards)) {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
      card_trasher.trash()

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_options',
        instructions: `Choose One:`,
        minimum: 1,
        maximum: 1,
        options: [
          {text: '+2 cards and +1 action', value: 'cards'},
          {text: '+1 buy and +$2', value: 'coins'}
        ]
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card_player)
      turn_event_processor.process(SpiceMerchant.process_response)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not trash anything`)
    }
  }

  static process_response(game, player_cards, response, card_player) {
    if (response[0] === 'cards') {
      let card_drawer = new CardDrawer(game, player_cards, card_player)
      card_drawer.draw(2)

      let action_gainer = new ActionGainer(game, player_cards)
      action_gainer.gain(1)
    } else if (response[0] === 'coins') {
      let buy_gainer = new BuyGainer(game, player_cards)
      buy_gainer.gain(1)

      let coin_gainer = new CoinGainer(game, player_cards, card_player)
      coin_gainer.gain(2)
    }
  }

}
