Forager = class Forager extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    if (_.size(player_cards.hand) > 1) {
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to trash:',
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Forager.trash_card)
    } else if (_.size(player_cards.hand) === 1) {
      Forager.trash_card(player_cards.hand)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }

    let trashed_treasures = _.filter(game.trash, function(card) {
      return _.includes(_.words(card.types), 'treasure')
    })
    let unique_treasure_count = _.size(_.uniqBy(trashed_treasures, 'name'))

    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(unique_treasure_count)
  }

  static trash_card(game, player_cards, selected_cards) {
    let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
    card_trasher.trash()
  }

}
