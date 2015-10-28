Witch = class Witch extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(player_cards, game);
    [player_cards, game] = card_drawer.draw(2)

    Games.update(game._id, game)
    PlayerCards.update(player_cards._id, player_cards)
  }

  attack(game, player) {
    let player_cards = PlayerCards.findOne({
      player_id: player._id,
      game_id: game._id
    })

    let card_gainer = new CardGainer(game, player.username, player_cards.discard, 'Curse');
    [game, player_cards.discard] = card_gainer.gain_common_card()

    PlayerCards.update(player_cards._id, player_cards)
    Games.update(game._id, game)
  }

}
