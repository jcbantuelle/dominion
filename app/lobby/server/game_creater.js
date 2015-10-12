GameCreater = class GameCreater {

  constructor(players, cards) {
    this.players = players
    this.cards = cards
  }

  create() {
    Games.insert({
      players: this.players,
      cards: this.cards
    })
  }

}
