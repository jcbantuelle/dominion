Urchin = class Urchin extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    GameModel.update(game._id, game)
    PlayerCardsModel.update(game._id, player_cards)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)
  }

  attack(game, player_cards) {
    let number_to_discard = _.size(player_cards.hand) - 4

    if (number_to_discard > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose ${number_to_discard} cards to discard from hand:`,
        cards: player_cards.hand,
        minimum: number_to_discard,
        maximum: number_to_discard
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Urchin.discard_from_hand)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> only has ${_.size(player_cards.hand)} cards in hand`)
    }
  }

  play_card_event(card_player, urchin) {
    let card_trasher = new CardTrasher(card_player.game, card_player.player_cards, 'in_play', urchin)
    let trashed_cards = card_trasher.trash()

    if (!_.isEmpty(trashed_cards) && trashed_cards[0].id === urchin.id) {
      let card_gainer = new CardGainer(card_player.game, card_player.player_cards, 'discard', 'Mercenary')
      card_gainer.gain()
    }
  }

  static discard_from_hand(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
    card_discarder.discard()
  }

}
