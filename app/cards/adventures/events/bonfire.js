Bonfire = class Bonfire extends Event {

  coin_cost() {
    return 3
  }

  buy(game, player_cards) {
    let cards_in_play = this.cards_in_play(player_cards)
    if (_.size(cards_in_play) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose up to 2 cards to trash:',
        cards: cards_in_play,
        minimum: 0,
        maximum: 2
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Bonfire.trash_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in play`)
    }
  }

  cards_in_play(player_cards) {
    return _.reduce(['in_play', 'duration', 'permanent'], function(in_play_cards, source) {
      let source_cards = _.map(player_cards[source], function(card) {
        card.source = _.startCase(source)
        return card
      })
      return in_play_cards.concat(source_cards)
    }, [])
  }

  static trash_cards(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;but does not trash anything`)
    } else {
      _.each(selected_cards, function(card) {
        let card_trasher = new CardTrasher(game, player_cards, _.snakeCase(card.source), card.name)
        card_trasher.trash()
      })
    }
  }
}
