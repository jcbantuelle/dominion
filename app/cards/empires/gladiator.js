Gladiator = class Gladiator extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  stack_name() {
    return 'Gladiator/Fortune'
  }

  play(game, player_cards, card_player) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2)

    if (_.size(player_cards.hand) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to reveal:',
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card_player.card)
      turn_event_processor.process(Gladiator.reveal_card)
    } else if (_.size(player_cards.hand) === 1) {
      Gladiator.reveal_card(game, player_cards, player_cards.hand, card_player.card)
    } else {
      game.log.push(`&nbsp;&nbsp;but <strong>${player_cards.username}</strong> has no cards in hand`)
    }
  }

  static reveal_card(game, player_cards, selected_cards, gladiator) {
    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal('hand', selected_cards[0])

    let next_player_query = new NextPlayerQuery(game, player_cards.player_id)
    let next_player_cards = PlayerCardsModel.findOne(game._id, next_player_query.next_player()._id)

    let revealed_copy = _.find(next_player_cards.hand, function(card) {
      return card.name === selected_cards[0].name
    })
    let response = 'no'
    if (revealed_copy) {
      GameModel.update(game._id, game)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: next_player_cards.player_id,
        username: next_player_cards.username,
        type: 'choose_yes_no',
        instructions: `Reveal ${CardView.render(revealed_copy)}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, next_player_cards, turn_event_id)
      response = turn_event_processor.process(Gladiator.reveal_copy)
    }

    if (response === 'yes') {
      let card_revealer = new CardRevealer(game, next_player_cards)
      card_revealer.reveal('hand', revealed_copy)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${next_player_cards.username}</strong> does not reveal a copy`)

      let coin_gainer = new CoinGainer(game, player_cards)
      coin_gainer.gain(1)

      let supply_card_trasher = new SupplyCardTrasher(game, player_cards, gladiator.stack_name, gladiator)
      supply_card_trasher.trash()
    }
  }

  static reveal_copy(game, next_player_cards, response) {
    return response
  }

}
