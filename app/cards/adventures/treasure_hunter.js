TreasureHunter = class TreasureHunter extends Traveller {

  is_purchasable() {
    false
  }

  types() {
    return ['action', 'traveller']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    game.turn.actions += 1
    let gained_coins = CoinGainer.gain(game, player_cards, 1)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action and +$${gained_coins}`)

    let previous_player_query = new PreviousPlayerQuery(game, player_cards.player_id)
    let previous_player_cards = PlayerCardsModel.findOne(game._id, previous_player_query.previous_player()._id)

    _.times(_.size(previous_player_cards.last_turn_gained_cards), function() {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Silver')
      card_gainer.gain_game_card()
    })
  }

  discard_event(discarder) {
    this.choose_exchange(discarder.game, discarder.player_cards, 'Treasure Hunter', 'Warrior')
  }

}
