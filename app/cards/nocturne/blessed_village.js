BlessedVillage = class BlessedVillage extends Card {

  types() {
    return ['action', 'fate']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions`)
  }

  gain_event(gainer) {
    if (_.size(gainer.game.boons_deck) === 0) {
      gainer.game.boons_deck = _.shuffle(gainer.game.boons_discard)
      gainer.game.boons_discard = []
    }

    taken_boon = gainer.game.boons_deck.shift()
    gainer.game.log.push(`&nbsp;&nbsp;<strong>${gainer.player_cards.username}</strong> takes ${CardView.render(taken_boon)}`)
    PlayerCardsModel.update(gainer.game._id, gainer.player_cards)
    GameModel.update(gainer.game._id, gainer.game)

    let turn_event_id = TurnEventModel.insert({
      game_id: gainer.game._id,
      player_id: gainer.player_cards.player_id,
      username: gainer.player_cards.username,
      type: 'choose_options',
      instructions: `Receive Boon now or next turn?`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: 'Now', value: 'now'},
        {text: 'Next Turn', value: 'later'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(gainer.game, gainer.player_cards, turn_event_id, taken_boon)
    turn_event_processor.process(BlessedVillage.choose_receive)
  }

  static choose_receive(game, player_cards, choice, taken_boon) {
    choice = choice[0]
    if (choice === 'now') {
      let boon = ClassCreator.create(taken_boon.name)
      let keep_boon = boon.receive(game, player_cards)
      if (keep_boon) {
        player_cards.boons.push(taken_boon)
      } else {
        game.boons_discard.unshift(taken_boon)
      }
    } else if (choice === 'later') {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses to receive the boon next turn`)
      player_cards.saved_boons.push(taken_boon)
    }
  }

}
