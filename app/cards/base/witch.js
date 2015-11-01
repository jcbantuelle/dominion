Witch = class Witch extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)

    Games.update(game._id, game)
    PlayerCards.update(player_cards._id, player_cards)
  }

  attack(game, player) {
    let player_cards = PlayerCards.findOne({
      player_id: player._id,
      game_id: game._id
    })

    let card_gainer = new CardGainer(game, player.username, player_cards.discard, 'Curse')
    card_gainer.gain_common_card()

    PlayerCards.update(player_cards._id, player_cards)
    Games.update(game._id, game)
  }

}
