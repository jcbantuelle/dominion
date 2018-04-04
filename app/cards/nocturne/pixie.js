Pixie = class Pixie extends Card {

  types() {
    return ['action', 'fate']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    if (_.size(game.boons_deck) === 0) {
      game.boons_deck = _.shuffle(game.boons_discard)
      game.boons_discard = []
    }

    discarded_boon = game.boons_deck.shift()
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> discards ${CardView.render(discarded_boon, true)} from the boon deck`)
    PlayerCardsModel.update(game._id, player_cards)
    GameModel.update(game._id, game)

    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_yes_no',
      instructions: `Trash ${CardView.render(this)} to receive ${CardView.render(discarded_boon, true)} twice?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, discarded_boon)
    turn_event_processor.process(Pixie.trash_self)
  }

  static trash_self(game, player_cards, response, discarded_boon) {
    if (response === 'yes') {
      let card_trasher = new CardTrasher(game, player_cards, 'playing', 'Pixie')
      card_trasher.trash()

      let boon = ClassCreator.create(discarded_boon.name)
      let keep_boon = boon.receive(game, player_cards)
      if (keep_boon) {
        player_cards.boons.push(discarded_boon)
      } else {
        game.boons_discard.unshift(discarded_boon)
      }
      PlayerCardsModel.update(game._id, player_cards)
      GameModel.update(game._id, game)
      boon.receive(game, player_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to trash`)
      game.boons_discard.unshift(discarded_boon)
    }
  }

}
