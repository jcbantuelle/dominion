MountainVillage = class MountainVillage extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    game.turn.actions += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions`)

    let discarded_cards = player_cards.discard

    if (_.size(discarded_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to put in hand:',
        cards: discarded_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(MountainVillage.put_in_hand)
    } else {
      game.log.push(`&nbsp;&nbsp;but the discard pile is empty`)
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(1)
    }
  }

  static put_in_hand(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    let card_index = _.findIndex(player_cards.discard, function (card) {
      return card.name === selected_card.name
    })
    player_cards.hand.unshift(player_cards.discard[card_index])
    player_cards.discard.splice(card_index, 1)

    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts a card in hand from their discard`)
  }

}
