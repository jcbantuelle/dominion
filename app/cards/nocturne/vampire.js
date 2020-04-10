Vampire = class Vampire extends Card {

  types() {
    return ['night', 'attack', 'doom']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, player) {
    if (_.size(game.hexes_deck) === 0) {
      game.hexes_deck = _.shuffle(game.hexes_discard)
      game.hexes_discard = []
    }

    game.turn.vampire_hex = game.hexes_deck.shift()
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> draws ${CardView.render(game.turn.vampire_hex)} from the Hex Deck`)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)

    game.hexes_discard.push(game.turn.vampire_hex)
    delete game.turn.vampire_hex

    let eligible_cards = _.filter(game.cards, function(card) {
      return card.count > 0 && card.top_card.purchasable && card.name !== 'Vampire' && CardCostComparer.coin_less_than(game, card.top_card, 6)
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
      turn_event_processor.process(Vampire.gain_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }

    let played_vampire_index = _.findIndex(player_cards.playing, function(card) {
      return card.id === player.played_card.id
    })
    if (played_vampire_index !== -1) {
      let played_vampire = player_cards.playing.splice(played_vampire_index, 1)[0]
      let vampire_stack = _.find(game.cards, (card) => {
        return card.name === 'Vampire'
      })
      vampire_stack.stack.unshift(played_vampire)
      vampire_stack.top_card = played_vampire
      vampire_stack.count += 1
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> returns ${CardView.render(played_vampire)}`)

      let bat_stack = _.find(game.cards, (card) => {
        return card.name === 'Bat'
      })
      if (bat_stack.count > 0) {
        let gained_bat = bat_stack.stack.shift()
        bat_stack.count -= 1
        if (bat_stack.count > 0) {
          bat_stack.top_card = _.head(bat_stack.stack)
        }
        player_cards.discard.unshift(gained_bat)
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> takes ${CardView.render(gained_bat)}`)
      } else {
        game.log.push(`&nbsp;&nbsp;but the ${CardView.render(new Bat())} pile is empty`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but ${CardView.render(this)} is no longer in play`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_card.name)
    card_gainer.gain_game_card()
  }

  attack(game, player_cards) {
    let hex = ClassCreator.create(game.turn.vampire_hex.name)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> receives ${CardView.render(hex)}`)
    GameModel.update(game._id, game)
    hex.receive(game, player_cards)
  }

}
