Hermit = class Hermit extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let eligible_trash_cards = this.trashable_cards(player_cards.hand, 'H').concat(this.trashable_cards(player_cards.discard, 'D'))

    if (_.size(eligible_trash_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to trash (Or none to skip):',
        cards: eligible_trash_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Hermit.trash_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }

    let all_player_cards = PlayerCardsModel.find(game._id)

    let eligible_cards = _.filter(game.cards, function(card) {
      let coin_cost = CostCalculator.calculate(game, card.top_card, all_player_cards)
      return card.count > 0 && card.top_card.purchasable && coin_cost <= 3 && card.top_card.potion_cost === 0
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: 'Choose a card to gain:',
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Hermit.gain_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  discard_from_play(game, player_cards) {
    let card_trasher = new CardTrasher(game, player_cards, 'discarding', 'Hermit')
    card_trasher.trash()

    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Madman')
    card_gainer.gain_game_card()
  }

  trashable_cards(source, letter) {
    return _.chain(source).filter(function(card) {
      return !_.contains(card.types, 'treasure')
    }).map(function(card) {
      let trashable_card = _.clone(card)
      trashable_card.source = letter
      return trashable_card
    }).value()
  }

  static trash_card(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let source = selected_cards[0].source === 'H' ? 'hand' : 'discard'
      let card_trasher = new CardTrasher(game, player_cards, source, selected_cards[0].name)
      card_trasher.trash()
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain_game_card()
  }

}
