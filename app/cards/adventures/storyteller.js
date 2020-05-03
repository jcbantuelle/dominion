Storyteller = class Storyteller extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    let coin_gainer = new CoinGainer(game, player_cards, card_player)
    coin_gainer.gain(1)

    let eligible_treasures = _.filter(player_cards.hand, function(card) {
      return _.includes(_.words(card.types), 'treasure')
    })
    if (_.size(eligible_treasures) > 0) {
      GameModel.update(game._id, game)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose up to 3 treasures to play:',
        cards: eligible_treasures,
        minimum: 0,
        maximum: 3
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Storyteller.choose_treasures, card_player.card)
    } else {
      Storyteller.choose_treasures(game, player_cards, [], card_player.card)
    }
  }

  static choose_treasures(game, player_cards, selected_cards, storyteller) {
    let non_bulk_playable_treasures = _.difference(_.map(selected_cards, 'name'), AllCoinPlayer.bulk_playable_treasures())
    if (_.size(selected_cards) > 1 && !_.isEmpty(non_bulk_playable_treasures)) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'sort_cards',
        instructions: 'Choose order to play treasures: (leftmost will be first)',
        cards: selected_cards
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, storyteller)
      turn_event_processor.process(Storyteller.play_treasures)
    } else {
      Storyteller.play_treasures(game, player_cards, selected_cards, storyteller)
    }
  }

  static play_treasures(game, player_cards, ordered_cards, storyteller) {
    _.each(ordered_cards, function(card) {
      let card_player = new CardPlayer(game, player_cards, card, storyteller)
      card_player.play(true)
    })
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> spends $${game.turn.coins}`)
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(game.turn.coins)
    game.turn.coins = 0
  }

}
