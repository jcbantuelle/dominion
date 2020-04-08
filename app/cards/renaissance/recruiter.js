Recruiter = class Recruiter extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)

    PlayerCardsModel.update(game._id, player_cards)

    if (_.size(player_cards.hand) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to trash:',
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Recruiter.trash_card)
    } else if (_.size(player_cards.hand) === 1) {
      Recruiter.trash_card(game, player_cards, player_cards.hand)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    let trashed_card = selected_cards[0]
    if (trashed_card) {
      let coin_cost = CostCalculator.calculate(game, trashed_card)

      let card_trasher = new CardTrasher(game, player_cards, 'hand', trashed_card)
      card_trasher.trash()

      if (game.turn.player._id === player_cards.player_id) {
        if (game.turn.possessed) {
          possessing_player_cards = PlayerCardsModel.findOne(game._id, game.turn.possessed._id)
          possessing_player_cards.villagers += coin_cost
          game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> gets +${coin_cost} villagers`)
          PlayerCardsModel.update(game._id, possessing_player_cards)
        } else {
          player_cards.villagers += coin_cost
          game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +${coin_cost} villagers`)
        }
      }
    }
  }
}
