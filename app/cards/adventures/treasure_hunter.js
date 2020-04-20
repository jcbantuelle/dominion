TreasureHunter = class TreasureHunter extends Traveller {

  types() {
    return ['action', 'traveller']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(1)

    let previous_player_query = new PreviousPlayerQuery(game, player_cards.player_id)
    let previous_player_cards = PlayerCardsModel.findOne(game._id, previous_player_query.previous_player()._id)

    _.times(_.size(previous_player_cards.last_turn_gained_cards), function() {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Silver')
      card_gainer.gain()
    })
  }

  discard_event(discarder, treasure_hunter) {
    this.choose_exchange(discarder.game, discarder.player_cards, treasure_hunter, 'Warrior')
  }

}
