Goons = class Goons extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 6
  }

  play(game, player_cards) {
    game.turn.buys += 1
    let gained_coins = CoinGainer.gain(game, player_cards, 2)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy and +$${gained_coins}`)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)
  }

  attack(game, player_cards) {
    let number_to_discard = _.size(player_cards.hand) - 3

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
      turn_event_processor.process(Goons.discard_from_hand)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> only has ${_.size(player_cards.hand)} cards in hand`)
    }
  }

  buy_event(buyer) {
    let goon_count = _.size(_.filter(this.player_cards.in_play, function(card) {
      return card.name === 'Goons'
    }))
    if (goon_count > 0) {
      if (this.game.turn.possessed) {
        possessing_player_cards = PlayerCardsModel.findOne(this.game._id, this.game.turn.possessed._id)
        possessing_player_cards.victory_tokens += goon_count
        this.game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> gets +${goon_count} &nabla; from ${CardView.render(new Goons())}`)
        PlayerCardsModel.update(this.game._id, possessing_player_cards)
      } else {
        this.player_cards.victory_tokens += goon_count
        this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> gets +${goon_count} &nabla; from ${CardView.render(new Goons())}`)
      }
    }
  }

  static discard_from_hand(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
    card_discarder.discard()
  }

}
