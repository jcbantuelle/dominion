Bureaucrat = class Bureaucrat extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let original_deck_size = _.size(player_cards.deck)
    let card_gainer = new CardGainer(game, player_cards.username, player_cards.deck, 'Silver');
    [game, player_cards.deck] = card_gainer.gain_common_card()
    if (_.size(player_cards.deck) > original_deck_size) {
      game.log.push(`&nbsp;&nbsp;putting it on top of their deck`)
    }

    Games.update(game._id, game)
    PlayerCards.update(player_cards._id, player_cards)
  }

  attack(game, player) {
    let player_cards = PlayerCards.findOne({
      player_id: player._id,
      game_id: game._id
    })

    let eligible_cards = _.filter(player_cards.hand, function(card) {
      return _.contains(card.types, 'victory')
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEvents.insert({
        game_id: game._id,
        player_id: player._id,
        username: player.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a victory card to place on deck:',
        cards: eligible_cards,
        minimum: 1,
        maximum: 1,
        finished: false
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      return turn_event_processor.process(this.return_card_to_deck)
    } else {
      let hand_cards = _.map(player_cards.hand, function(card) {
        return `<span class="${card.types}">${card.name}</span>`
      }).join(' ')
      game.log.push(`&nbsp;&nbsp;<strong>${player.username}</strong> reveals ${hand_cards}`)
      Games.update(game._id, game)
    }
  }

  return_card_to_deck(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    let card_index = _.findIndex(player_cards.hand, function(card) {
      return card.name === selected_card.name
    })

    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places <span class="${selected_card.type}">${selected_card.name}</span> on top of their deck`)

    player_cards.deck.unshift(player_cards.hand[card_index])
    player_cards.hand.splice(card_index, 1)

    Games.update(game._id, game)
    PlayerCards.update(player_cards._id, player_cards)
  }

}
