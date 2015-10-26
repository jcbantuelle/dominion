CouncilRoom = class CouncilRoom extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(player_cards, game);
    [player_cards, game] = card_drawer.draw(4, true)

    _.each(this.other_players(game), function(player) {
      let other_player_cards = PlayerCards.findOne({
        game_id: game._id,
        player_id: player._id
      })

      let other_player_card_drawer = new CardDrawer(other_player_cards, game);
      [other_player_cards,game] = other_player_card_drawer.draw(1, true)
      PlayerCards.update(other_player_cards._id, other_player_cards)
    })

    game.turn.buy += 1
    game.log.push(`&nbsp;&nbsp;<strong>${Meteor.user().username}</strong> gets +1 buy`)
    Games.update(game._id, game)
    PlayerCards.update(player_cards._id, player_cards)
  }

}
