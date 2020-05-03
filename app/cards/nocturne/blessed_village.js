BlessedVillage = class BlessedVillage extends Card {

  types() {
    return ['action', 'fate']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(2)
  }

  gain_event(gainer, blessed_village) {
    if (_.size(gainer.game.boons_deck) === 0) {
      gainer.game.boons_deck = _.shuffle(gainer.game.boons_discard)
      gainer.game.boons_discard = []
    }

    let boon = gainer.game.boons_deck.shift()
    gainer.game.log.push(`&nbsp;&nbsp;<strong>${gainer.player_cards.username}</strong> takes ${CardView.render(boon)}`)

    GameModel.update(gainer.game._id, gainer.game)

    let turn_event_id = TurnEventModel.insert({
      game_id: gainer.game._id,
      player_id: gainer.player_cards.player_id,
      username: gainer.player_cards.username,
      type: 'choose_options',
      instructions: `Receive ${CardView.render(boon)} now or next turn?`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: 'Now', value: 'now'},
        {text: 'Next Turn', value: 'later'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(gainer.game, gainer.player_cards, turn_event_id)
    let choice = turn_event_processor.process(BlessedVillage.choose_receive)

    if (choice === 'now') {
      this.process_boon(gainer.game, gainer.player_cards, boon)
    } else if (choice === 'later') {
      let blessed_village_effect = _.clone(blessed_village)
      blessed_village_effect.boon = boon
      gainer.player_cards.start_turn_event_effects.push(blessed_village_effect)
      gainer.game.log.push(`&nbsp;&nbsp;<strong>${gainer.player_cards.username}</strong> chooses to receive ${CardView.render(boon)} next turn`)
    }
  }

  process_boon(game, player_cards, boon) {
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> receives ${CardView.render(boon)}`)
    GameModel.update(game._id, game)
    let keep = ClassCreator.create(boon.name).receive(game, player_cards)
    if (keep) {
      player_cards.boons.push(boon)
    } else {
      game.boons_discard.unshift(boon)
    }
  }

  start_turn_event(game, player_cards, blessed_village) {
    this.process_boon(game, player_cards, blessed_village.boon)
  }

  static choose_receive(game, player_cards, choice, taken_boon) {
    return choice[0]
  }

}
