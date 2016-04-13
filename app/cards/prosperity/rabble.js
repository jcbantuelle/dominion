Rabble = class Rabble extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(3)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)
  }

  attack(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;but has no cards in deck`)
    } else {
      player_cards.revealed = _.take(player_cards.deck, 3)
      player_cards.deck = _.drop(player_cards.deck, 3)

      let revealed_card_count = _.size(player_cards.revealed)
      if (revealed_card_count < 3 && _.size(player_cards.discard) > 0) {
        DeckShuffler.shuffle(game, player_cards)
        player_cards.revealed = player_cards.revealed.concat(_.take(player_cards.deck, 3 - revealed_card_count))
        player_cards.deck = _.drop(player_cards.deck, 3 - revealed_card_count)
      }

      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.revealed)}`)

      let discarded_cards = _.filter(player_cards.revealed, function(card) {
        return _.includes(_.words(card.types), 'action') || _.includes(_.words(card.types), 'treasure')
      })

      let card_discarder = new CardDiscarder(game, player_cards, 'revealed', _.map(discarded_cards, 'name'))
      card_discarder.discard()

      if (!_.isEmpty(player_cards.revealed)) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'sort_cards',
          instructions: 'Choose order to place cards on deck: (leftmost will be top card)',
          cards: player_cards.revealed
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Rabble.replace_cards)
      }
    }
  }

  static replace_cards(game, player_cards, ordered_card_names) {
    _.each(ordered_card_names.reverse(), function(card_name) {
      let revealed_card_index = _.findIndex(player_cards.revealed, function(card) {
        return card.name === card_name
      })
      let revealed_card = player_cards.revealed.splice(revealed_card_index, 1)[0]
      player_cards.deck.unshift(revealed_card)
    })
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places the cards back on their deck`)
    player_cards.revealed = []
  }

}
