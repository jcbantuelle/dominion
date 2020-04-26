Citadel = class Citadel extends Project {

  coin_cost() {
    return 8
  }

  action_resolution_event(game, player_cards, citadel, resolved_action) {
    game.log.push(`<strong>${player_cards.username}</strong> resolves ${CardView.render(citadel)}`)
    GameModel.update(game._id, game)
    let card_player = new CardPlayer(game, player_cards, resolved_action)
    card_player.play(true, false, 'in_play')
  }

}
