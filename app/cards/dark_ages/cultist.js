Cultist = class Cultist extends Card {

  types() {
    return ['action', 'attack', 'looter']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)

    let cultist = _.find(player_cards.hand, function(card) {
      return card.name === 'Cultist'
    })
    if (cultist) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: `Play ${CardView.render(cultist)} from hand?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, cultist)
      turn_event_processor.process(Cultist.play_cultist)
    }
  }

  attack(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Ruins')
    card_gainer.gain()
  }

  static play_cultist(game, player_cards, response, cultist) {
    if (response === 'yes') {
      let card_player = new CardPlayer(game, player_cards, cultist)
      card_player.play(true)
    }
  }

  trash_event(trasher) {
    let card_drawer = new CardDrawer(trasher.game, trasher.player_cards)
    card_drawer.draw(3)
  }

}
