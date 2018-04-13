TheRiversGift = class TheRiversGift extends Boon {

  receive(game, player_cards) {
    let river_gift = this.to_h()
    river_gift.target_player_id = player_cards.player_id
    game.turn.river_gifts.push(river_gift)
    return true
  }

  end_turn_event(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)
    let river_gift_index = _.findIndex(game.turn.river_gifts, function(player_id) {
      return player_id === player_cards.player_id
    })
    game.turn.river_gifts.splice(river_gift_index, 1)
  }

}
