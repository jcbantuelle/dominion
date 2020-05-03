Pixie = class Pixie extends Card {

  types() {
    return ['action', 'fate']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    if (_.size(game.boons_deck) === 0) {
      game.boons_deck = _.shuffle(game.boons_discard)
      game.boons_discard = []
    }

    discarded_boon = game.boons_deck.shift()
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> discards ${CardView.render(discarded_boon)} from the boon deck`)

    let pixie = _.find(player_cards.in_play, (card) => {
      return card.id === card_player.card.id
    })

    let response = 'no'
    let keep_boon = false
    if (pixie) {
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: `Trash ${CardView.render(card_player.card)} to receive ${CardView.render(discarded_boon)} twice?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      response = turn_event_processor.process(Pixie.trash_self)
    } else {
      game.log.push(`&nbsp;&nbsp;but ${CardView.render(card_player.card)} is no longer in play`)
    }

    if (response === 'yes') {
      let card_trasher = new CardTrasher(game, player_cards, 'in_play', card_player.card)
      card_trasher.trash()

      let boon_object = ClassCreator.create(discarded_boon.name)
      keep_boon = boon_object.receive(game, player_cards)
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      boon_object.receive(game, player_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to trash ${CardView.render(card_player.card)}`)
    }

    if (keep_boon) {
      player_cards.boons.push(discarded_boon)
    } else {
      game.boons_discard.unshift(discarded_boon)
    }
  }

  static trash_self(game, player_cards, response, params) {
    return response
  }

}
