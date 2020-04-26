Reserve = class Reserve extends Card {

  static move_to_tavern(game, player_cards, reserve_card) {
    let card_mover = new CardMover(game, player_cards)
    if (card_mover.move(player_cards.in_play, player_cards.tavern, reserve_card)) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(reserve_card)} on their Tavern`)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>but ${CardView.render(reserve_card)} is not in play`)
    }
  }

  static call_from_tavern(game, player_cards, reserve_card) {
    let card_mover = new CardMover(game, player_cards)
    card_mover.move(player_cards.tavern, player_cards.in_play, reserve_card)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> calls ${CardView.render(reserve_card)} from their Tavern`)
  }

}
