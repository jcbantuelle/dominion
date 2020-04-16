ScryingPool = class ScryingPool extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 2
  }

  potion_cost() {
    return 1
  }

  play(game, player_cards) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    ScryingPool.reveal_card(game, player_cards)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)

    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal_from_deck_until((game, revealed_cards) => {
      if (!_.isEmpty(revealed_cards)) {
        return !_.includes(_.words(_.last(revealed_cards).types), 'action')
      } else {
        return false
      }
    })

    if (!_.isEmpty(player_cards.revealed)) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(player_cards.revealed)} in hand`)
      let card_mover = new CardMover(game, player_cards)
      card_mover.move_all(player_cards.revealed, player_cards.hand)
    }
  }

  attack(game, player_cards) {
    ScryingPool.reveal_card(game, player_cards)
  }

  static reveal_card(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(1)

      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)

      let instructions = `Make <strong>${player_cards.username}</strong> discard ${CardView.render(player_cards.revealed)}?`
      if (game.turn.player._id === player_cards.player_id) {
        instructions = `Discard ${CardView.render(player_cards.revealed)}?`
      }
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: game.turn.player._id,
        username: game.turn.player.username,
        type: 'choose_yes_no',
        instructions: instructions,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(ScryingPool.discard_card)
    }
  }

  static discard_card(game, player_cards, response) {
    if (response === 'yes') {
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard()
    } else {
      let card_returner = new CardReturner(game, player_cards)
      card_returner.return_to_deck(player_cards.revealed)
    }
  }

}
