Storyteller = class Storyteller extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    game.turn.actions += 1
    let gained_coins = CoinGainer.gain(game, player_cards, 1)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action and +$${gained_coins}`)

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
      turn_event_processor.process(Storyteller.choose_treasures)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses not to play any treasures`)
    }

    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> spends $${game.turn.coins}`)
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(game.turn.coins)
    game.turn.coins = 0
  }

  static choose_treasures(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let non_bulk_playable_treasures = _.difference(_.map(selected_cards, 'name'), AllCoinPlayer.bulk_playable_treasures())
      if (!_.isEmpty(non_bulk_playable_treasures && _.size(selected_cards) > 1)) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'sort_cards',
          instructions: 'Choose order to play treasures: (leftmost will be first)',
          cards: selected_cards
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Storyteller.play_treasures)
      } else {
        Storyteller.play_treasures(game, player_cards, _.map(selected_cards, 'name'))
      }
    }
  }

  static play_treasures(game, player_cards, ordered_card_names) {
    _.each(ordered_card_names, function(card_name) {
      let card_player = new CardPlayer(game, player_cards, card_name, true)
      card_player.play()
      Storyteller.push_treasure_into_play(game, player_cards, card_name)
    })
    GameModel.update(game._id, game)
    PlayerCardsModel.update(game._id, player_cards)
  }

  static push_treasure_into_play(game, player_cards, card_name) {
    let treasure_index = _.findIndex(player_cards.playing, function(card) {
      return card.name === card_name
    })
    let treasure = player_cards.playing.splice(treasure_index, 1)[0]
    let destination = treasure.destination
    delete treasure.processed
    delete treasure.destination
    if (destination) {
      player_cards[destination].push(treasure)
    } else {
      player_cards.in_play.push(treasure)
    }
  }

}
