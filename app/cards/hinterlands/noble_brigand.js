NobleBrigand = class NobleBrigand extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let gained_coins = CoinGainer.gain(game, player_cards, 1)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)

    game.turn.trashed_treasures = []
    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)
    _.each(game.turn.trashed_treasures, function(treasure) {
      let card_gainer = new CardGainer(game, player_cards, 'discard', treasure.name)
      card_gainer.gain_trash_card()
    })
    delete game.turn.trashed_treasure
  }

  buy_event(buyer) {
    buyer.game.turn.trashed_treasures = []
    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(buyer.game)
    ordered_player_cards.shift()
    _.each(ordered_player_cards, (other_player_cards) => {
      this.attack(buyer.game, other_player_cards)
      PlayerCardsModel.update(buyer.game._id, other_player_cards)
    })

    _.each(buyer.game.turn.trashed_treasures, function(treasure) {
      let card_gainer = new CardGainer(buyer.game, buyer.player_cards, 'discard', treasure.name)
      card_gainer.gain_trash_card()
    })
    delete buyer.game.turn.trashed_treasure
  }

  attack(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      player_cards.revealed = _.take(player_cards.deck, 2)
      player_cards.deck = _.drop(player_cards.deck, 2)

      let revealed_card_count = _.size(player_cards.revealed)
      if (revealed_card_count < 2 && _.size(player_cards.discard) > 0) {
        DeckShuffler.shuffle(game, player_cards)
        player_cards.revealed = player_cards.revealed.concat(_.take(player_cards.deck, 2 - revealed_card_count))
        player_cards.deck = _.drop(player_cards.deck, 2 - revealed_card_count)
      }

      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.revealed)}`)

      let revealed_treasures = _.filter(player_cards.revealed, function(card) {
        return _.includes(['Silver', 'Gold'], card.name)
      })
      if (_.isEmpty(revealed_treasures)) {
        let any_treasures = _.some(player_cards.revealed, function(card) {
          return _.includes(_.words(card.types), 'treasure')
        })
        let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
        card_discarder.discard()
        if (!any_treasures) {
          let card_gainer = new CardGainer(game, player_cards, 'discard', 'Copper')
          card_gainer.gain_game_card()
        }
      } else if (_.size(revealed_treasures) === 1) {
        return NobleBrigand.trash_treasure(game, player_cards, revealed_treasures[0])
      } else {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: game.turn.player._id,
          username: game.turn.player.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: `Choose one of <strong>${player_cards.username}'s</strong> treasures to trash:`,
          cards: revealed_treasures,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(NobleBrigand.choose_trashed_treasure)
      }
    }
  }

  static choose_trashed_treasure(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    return NobleBrigand.trash_treasure(game, player_cards, selected_card)
  }

  static trash_treasure(game, player_cards, trashed_treasure) {
    game.turn.trashed_treasures.push(trashed_treasure)
    let card_trasher = new CardTrasher(game, player_cards, 'revealed', trashed_treasure.name)
    card_trasher.trash()

    let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
    card_discarder.discard()

    GameModel.update(game._id, game)
  }

}
