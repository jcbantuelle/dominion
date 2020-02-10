ActingTroupe = class ActingTroupe extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    if (game.turn.possessed) {
      possessing_player_cards = PlayerCardsModel.findOne(game._id, game.turn.possessed._id)
      possessing_player_cards.villagers += 4
      game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> takes 4 villagers`)
      PlayerCardsModel.update(game._id, possessing_player_cards)
    } else {
      player_cards.villagers += 4
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> takes 4 villagers`)
    }

    let card_trasher = new CardTrasher(game, player_cards, 'playing', 'Acting Troupe')
    card_trasher.trash()
  }
}
