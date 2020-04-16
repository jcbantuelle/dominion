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
    let new_discard = []
    _.each(selected_cards, function(selected_card) {
      let card_index = _.findIndex(player_cards.discard, function(discard_card) {
        return discard_card.id === selected_card.id
      })
      new_discard.push(player_cards.discard.splice(card_index, 1)[0])
    })
    player_cards.deck = _.shuffle(player_cards.deck.concat(player_cards.discard))
    player_cards.discard = new_discard
    let discard_size = _.size(player_cards.discard)
    let shuffle_text = discard_size > 0 ? `all but ${discard_size} cards` : 'their discard'
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> shuffles ${shuffle_text} into thier deck`)
  }
}


