Villain = class Villain extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let coffer_gainer = new CofferGainer(game, player_cards)
    coffer_gainer.gain(2)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)
  }

  attack(game, player_cards) {
    if (_.size(player_cards.hand) > 4) {
      let eligible_cards = _.filter(player_cards.hand, function (card) {
        return CardCostComparer.coin_greater_than(game, card, 1)
      })

      if (_.size(eligible_cards) > 1) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose a card to discard:',
          cards: eligible_cards,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        return turn_event_processor.process(Villain.discard_from_hand)
      } else if (_.size(eligible_cards) === 1) {
        Villain.discard_from_hand(game, player_cards, eligible_cards)
      } else {
        let card_revealer = new CardRevealer(game, player_cards)
        card_revealer.reveal('hand')
      }
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> only has ${_.size(player_cards.hand)} cards in hand`)
    }
  }

  static discard_from_hand(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
    card_discarder.discard()
  }

}
