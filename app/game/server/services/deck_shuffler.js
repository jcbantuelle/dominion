DeckShuffler = class DeckShuffler {

  static shuffle(game, player_cards) {
    let stashes = _.filter(player_cards.discard, function(card) {
      return card.name === 'Stash'
    })
    if (!_.isEmpty(stashes)) {
      player_cards.discard = _.filter(player_cards.discard, function(card) {
        return card.name !== 'Stash'
      })
    }
    player_cards.deck = _.shuffle(player_cards.discard)
    player_cards.discard = []

    if (!_.isEmpty(stashes)) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> shuffles their deck`)
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      _.each(stashes, function(stash) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'overpay',
          player_cards: true,
          instructions: 'Choose where in your deck to put Stash (1 is top of deck):',
          minimum: 1,
          maximum: _.size(player_cards.deck) + 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, stash)
        turn_event_processor.process(DeckShuffler.insert_stash)
      })
    }
  }

  static insert_stash(game, player_cards, location, stash) {
    location = Number(location)
    player_cards.deck.splice(location-1, 0, stash)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> inserts ${CardView.render(stash)} as card #${location}`)
    GameModel.update(game._id, game)
  }

}
