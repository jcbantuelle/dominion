Bureaucrat = class Bureaucrat extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let original_deck_size = _.size(player_cards.deck)
    let card_gainer = new CardGainer(game, player_cards, 'deck', 'Silver')
    card_gainer.gain_game_card()
    if (_.size(player_cards.deck) > original_deck_size) {
      game.log.push(`&nbsp;&nbsp;putting it on top of their deck`)
    }

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack()
  }

  attack(game, player_cards) {
    let eligible_cards = _.filter(player_cards.hand, function(card) {
      return _.contains(card.types, 'victory')
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEvents.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a victory card to place on deck:',
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      return turn_event_processor.process(Bureaucrat.return_card_to_deck)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.hand)}`)
    }
  }

  static return_card_to_deck(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    let card_index = _.findIndex(player_cards.hand, function(card) {
      return card.name === selected_card.name
    })

    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places ${CardView.render(selected_card)} on top of their deck`)

    player_cards.deck.unshift(player_cards.hand[card_index])
    player_cards.hand.splice(card_index, 1)
  }

}
