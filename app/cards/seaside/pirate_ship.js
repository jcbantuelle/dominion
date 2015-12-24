PirateShip = class PirateShip extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose One:`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: 'Trash Opponent Treasures', value: 'attack'},
        {text: 'Gain Coins', value: 'coin'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(PirateShip.process_response)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)

    if (game.turn.pirate_ship_trashed) {
      player_cards.pirate_ship_coins += 1
    }
    delete game.turn.pirate_ship_trashed
    delete game.turn.pirate_ship_attack
  }

  static process_response(game, player_cards, response) {
    response = response[0]
    if (response === 'attack') {
      game.turn.pirate_ship_attack = true
    } else if (response === 'coin') {
      let gained_coins = CoinGainer.gain(game, player_cards, player_cards.pirate_ship_coins)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)
    }
  }

  attack(game, player_cards) {
    if (game.turn.pirate_ship_attack) {
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
          return _.contains(_.words(card.types), 'treasure')
        })
        if (_.isEmpty(revealed_treasures)) {
          game.log.push(`&nbsp;&nbsp;but there are no treasures to trash`)
          let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
          card_discarder.discard()
        } else if (_.size(revealed_treasures) === 1) {
          return PirateShip.trash_treasure(game, player_cards, revealed_treasures[0])
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
          turn_event_processor.process(PirateShip.choose_trashed_treasure)
        }
      }
    }
  }

  static choose_trashed_treasure(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    return PirateShip.trash_treasure(game, player_cards, selected_card)
  }

  static trash_treasure(game, player_cards, trashed_treasure) {
    game.turn.trashed_treasure = trashed_treasure
    let card_trasher = new CardTrasher(game, player_cards, 'revealed', trashed_treasure.name)
    card_trasher.trash()

    let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
    card_discarder.discard()

    game.turn.pirate_ship_trashed = true
  }

}
