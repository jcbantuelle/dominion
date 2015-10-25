Village = class Village extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play() {
    this.game = Games.findOne(Meteor.user().current_game)
    this.player_cards = PlayerCards.findOne({
      player_id: Meteor.userId(),
      game_id: this.game._id
    })

    let card_drawer = new CardDrawer(this.player_cards, this.game)
    let [player_cards, game] = card_drawer.draw(1, true)
    this.player_cards = player_cards
    this.game = game

    this.game.turn.actions += 2
    this.game.log.push(`&nbsp;&nbsp;<strong>${Meteor.user().username}</strong> gets +2 actions`)
    Games.update(this.game._id, this.game)
    PlayerCards.update(this.player_cards._id, this.player_cards)
  }

}
