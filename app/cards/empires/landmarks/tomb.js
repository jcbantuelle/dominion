Tomb = class Tomb extends Landmark {

  trash_event(trasher) {
    let game = trasher.game
    let player_cards = trasher.player_cards

    let victory_token_gainer = new VictoryTokenGainer(game, player_cards)
    victory_token_gainer.gain(1)
  }

}
