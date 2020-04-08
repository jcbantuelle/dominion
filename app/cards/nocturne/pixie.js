Pixie = class Pixie extends Card {

  types() {
    return ['action', 'fate']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards, player) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    if (_.size(game.boons_deck) === 0) {
      game.boons_deck = _.shuffle(game.boons_discard)
      game.boons_discard = []
    }

    discarded_boon = game.boons_deck.shift()
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> discards ${CardView.render(discarded_boon)} from the boon deck`)
    PlayerCardsModel.update(game._id, player_cards)
    GameModel.update(game._id, game)

    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_yes_no',
      instructions: `Trash ${CardView.render(player.played_card)} to receive ${CardView.render(discarded_boon)} twice?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, {boon: discarded_boon, pixie: player.played_card})
    turn_event_processor.process(Pixie.trash_self)
  }

  static trash_self(game, player_cards, response, params) {
    if (response === 'yes') {
      let card_trasher = new CardTrasher(game, player_cards, 'playing', params.pixie)
      card_trasher.trash()

      let boon = ClassCreator.create(params.boon.name)
      let keep_boon = boon.receive(game, player_cards)
      if (keep_boon) {
        player_cards.boons.push(params.boon)
      } else {
        game.boons_discard.unshift(params.boon)
      }
      PlayerCardsModel.update(game._id, player_cards)
      GameModel.update(game._id, game)
      boon.receive(game, player_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to trash`)
      game.boons_discard.unshift(params.boon)
    }
  }

}
