WalledVillageResolver = class WalledVillageResolver {

  static resolve(game, player_cards, walled_villages) {
    let action_count = _.size(_.filter(player_cards.in_play.concat(player_cards.duration).concat(player_cards.permanent), function(card) {
      return _.includes(_.words(card.types), 'action')
    }))
    if (action_count < 3) {
      _.each(walled_villages, function(walled_village) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_yes_no',
          instructions: `Put ${CardView.render(walled_village)} on top of your deck?`,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(WalledVillageResolver.put_on_deck)
      })
    }
  }

  static put_on_deck(game, player_cards, response) {
    if (response === 'yes') {
      let walled_village_index = _.findIndex(player_cards.in_play, function(card) {
        return card.name === 'Walled Village'
      })
      player_cards.deck.unshift(player_cards.in_play.splice(walled_village_index, 1)[0])
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(new WalledVillage())} on top of their deck`)
      GameModel.update(game._id, game)
    }
  }

}
