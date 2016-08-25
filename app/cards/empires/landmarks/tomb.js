Tomb = class Tomb extends Landmark {

  trash_event(trasher) {
    let game = trasher.game
    let player_cards = trasher.player_cards
    if (game.turn.possessed) {
      possessing_player_cards = PlayerCardsModel.findOne(game._id, game.turn.possessed._id)
      possessing_player_cards.victory_tokens += 1
      game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> gets +1 &nabla; from ${CardView.render(this)}`)
      PlayerCardsModel.update(game._id, possessing_player_cards)
    } else {
      player_cards.victory_tokens += 1
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 &nabla; from ${CardView.render(this)}`)
    }
  }

}
