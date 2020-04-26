Legionary = class Legionary extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(3)

    let revealed_gold = false
    let gold = _.find(player_cards.hand, function(card) {
      return card.name === 'Gold'
    })
    if (gold) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: `Reveal ${CardView.render(gold)}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, gold)
      revealed_gold = turn_event_processor.process(Legionary.reveal_gold)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not reveal a ${CardView.render(new Gold())}`)
    }

    if (revealed_gold) {
      let player_attacker = new PlayerAttacker(game, this)
      player_attacker.attack(player_cards)
    }
  }

  static reveal_gold(game, player_cards, response, gold) {
    if (response === 'yes') {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal('hand', gold)
      return true
    } else {
      game.log.push(`&nbsp;&nbsp;but does not reveal a ${CardView.render(gold)}`)
    }
  }

  attack(game, player_cards) {
    let number_to_discard = _.size(player_cards.hand) - 2

    if (number_to_discard > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose ${number_to_discard} cards to discard from hand:`,
        cards: player_cards.hand,
        minimum: number_to_discard,
        maximum: number_to_discard
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Legionary.discard_from_hand)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> only has ${_.size(player_cards.hand)} cards in hand`)
    }
  }

  static discard_from_hand(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
    card_discarder.discard()

    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)
  }

}
