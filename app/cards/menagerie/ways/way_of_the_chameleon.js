WayOfTheChameleon = class WayOfTheChameleon extends Way {

  play(game, player_cards, card_player) {
    card_player.chameleon = true
    return ClassCreator.create(card_player.card.name).play(game, player_cards, card_player)
  }
}
