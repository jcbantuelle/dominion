AnimalFair = class AnimalFair extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 7
  }

  alternate_buy() {
    return true
  }

  play(game, player_cards, card_player) {
    let coin_gainer = new CoinGainer(game, player_cards, card_player)
    coin_gainer.gain(4)

    let empty_pile_count = _.size(_.filter(game.cards, function(game_card) {
      return game_card.count === 0 && game_card.supply
    }))

    if (empty_pile_count > 0) {
      let buy_gainer = new BuyGainer(game, player_cards)
      buy_gainer.gain(empty_pile_count)
    }
  }

  alternate_buyable(game, player_cards) {
    return _.find(player_cards.hand, (card) => {
      return _.includes(_.words(card.types), 'action')
    })
  }

  buy(game, player_cards) {
    let eligible_cards = _.filter(player_cards.hand, function(card) {
      return _.includes(_.words(card.types), 'action')
    })

    if (_.size(eligible_cards) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to trash:',
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, this)
      turn_event_processor.process(AnimalFair.trash_card)
    } else {
      AnimalFair.trash_card(game, player_cards, eligible_cards, this)
    }
  }

  static trash_card(game, player_cards, selected_cards, animal_fair) {
    let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
    card_trasher.trash(false)

    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> trashes ${CardView.render(selected_cards)} to pay for ${CardView.render(animal_fair)}`)
  }

}
