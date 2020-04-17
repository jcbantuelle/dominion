Mandarin = class Mandarin extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(3)

    if (_.size(player_cards.hand) > 1) {
      GameModel.update(game._id, game)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to place on deck:',
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Mandarin.return_card_to_deck)
    } else if (_.size(player_cards.hand) === 1) {
      Mandarin.return_card_to_deck(game, player_cards, player_cards.hand)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static return_card_to_deck(game, player_cards, selected_cards) {
    let card_returner = new CardReturner(game, player_cards)
    card_returner.return_to_deck(player_cards.hand, selected_cards)
  }

  gain_event(gainer) {
    let treasures = _.filter(gainer.player_cards.in_play, function(card) {
      return _.includes(_.words(card.types), 'treasure')
    })

    if (_.size(treasures) > 0) {
      let card_returner = new CardReturner(gainer.game, gainer.player_cards)
      card_returner.return_to_deck(gainer.player_cards.in_play, treasures)
    } else {
      game.log.push(`&nbsp;&nbsp;but <strong>${gainer.player_cards.username}</strong> does not have any treasures in play`)
    }
  }

}
