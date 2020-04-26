Vampire = class Vampire extends Card {

  types() {
    return ['night', 'attack', 'doom']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    if (_.size(game.hexes_deck) === 0) {
      game.hexes_deck = _.shuffle(game.hexes_discard)
      game.hexes_discard = []
    }

    hex = game.hexes_deck.shift()
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> draws ${CardView.render(hex)} from the Hex Deck`)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards, hex)

    game.hexes_discard.push(hex)

    let eligible_cards = _.filter(game.cards, (card) => {
      return card.count > 0 && card.supply && card.name !== 'Vampire' && CardCostComparer.coin_less_than(game, card.top_card, 6)
    })

    if (_.size(eligible_cards) > 1) {
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
      turn_event_processor.process(Vampire.gain_card)
    } else if (_.size(eligible_cards) === 1) {
      Vampire.gain_card(game, player_cards, eligible_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }

    let vampire_in_play = _.find(player_cards.in_play, (card) => {
      return card.id === card_player.card.id
    })
    if (vampire_in_play) {
      let bat_stack = _.find(game.cards, (card) => {
        return card.name === 'Bat'
      })
      if (bat_stack && bat_stack.count > 0) {
        let card_mover = new CardMover(game, player_cards)
        if (card_mover.return_to_supply(player_cards.in_play, 'Vampire', [card_player.card])) {
          card_mover.take_from_supply(player_cards.discard, bat_stack.top_card)
          game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> exchanges ${CardView.render(card_player.card)} for ${CardView.render(bat_stack.top_card)}`)
        }
      } else {
        game.log.push(`&nbsp;&nbsp;but there is no ${CardView.render(new Bat())} to exchange with ${CardView.render(card_player.card)}`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but cannot exhange ${CardView.render(card_player.card)} because it is no longer in play`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain()
  }

  attack(game, player_cards, attacker_player_cards, card_player, hex) {
    let hex_object = ClassCreator.create(hex.name)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> receives ${CardView.render(hex)}`)
    GameModel.update(game._id, game)
    hex_object.receive(game, player_cards)
  }

}
