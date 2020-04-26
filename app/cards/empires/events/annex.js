Annex = class Annex extends Event {

  coin_cost() {
    return 0
  }

  debt_cost() {
    return 8
  }

  buy(game, player_cards) {
    if (_.size(player_cards.discard) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose up to 5 cards to keep in your discard:',
        cards: player_cards.discard,
        minimum: 0,
        maximum: 5
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Annex.shuffle_discard)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in discard`)
    }

    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Duchy')
    card_gainer.gain()
  }

  static shuffle_discard(game, player_cards, selected_cards) {
    let selected_card_ids = _.map(selected_cards, 'id')
    let cards_to_shuffle = _.filter(player_cards.discard, (card) => {
      return !_.includes(selected_card_ids, card.id)
    })
    let deck_shuffler = new DeckShuffler(game, player_cards)
    deck_shuffler.shuffle('discard', cards_to_shuffle)
    let discard_size = _.size(player_cards.discard)
    let shuffle_text = discard_size > 0 ? `all but ${discard_size} cards` : 'their discard'
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> shuffles ${shuffle_text} into their deck`)
  }
}


