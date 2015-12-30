Soldier = class Soldier extends Traveller {

  is_purchasable() {
    false
  }

  types() {
     return ['action', 'attack', 'traveller']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let attack_count = _.size(_.filter(player_cards.in_play.concat(player_cards.duration).concat(player_cards.permanent), function(card) {
      return _.contains(_.words(card.types), 'attack')
    }))

    let gained_coins = CoinGainer.gain(game, player_cards, 2 + attack_count)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)
  }

  attack(game, player_cards) {
    if (_.size(player_cards.hand) >= 4) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose a card to discard from hand:`,
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Soldier.discard_from_hand)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> only has ${_.size(player_cards.hand)} cards in hand`)
    }
  }

  static discard_from_hand(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', _.pluck(selected_cards, 'name'))
    card_discarder.discard()
  }

  discard_event(discarder) {
    this.choose_exchange(discarder.game, discarder.player_cards, 'Soldier', 'Fugitive')
  }

}
