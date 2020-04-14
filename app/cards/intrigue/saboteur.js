Saboteur = class Saboteur extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)
  }

  attack(game, player_cards) {
    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal_from_deck_until((game, revealed_cards) => {
      if (!_.isEmpty(revealed_cards)) {
        return CardCostComparer.coin_greater_than(game, _.last(revealed_cards), 2)
      } else {
        return false
      }
    })

    let card_to_trash = _.last(player_cards.revealed)
    if (CardCostComparer.coin_greater_than(game, card_to_trash, 2)) {
      let card_trasher = new CardTrasher(game, player_cards, 'revealed', card_to_trash)
      card_trasher.trash()

      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)

      let eligible_cards = _.filter(game.cards, function(card) {
        return card.count > 0 && card.supply && CardCostComparer.card_less_than(game, card_to_trash, card.top_card, -1)
      })
      if (_.size(eligible_cards) > 0) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          game_cards: true,
          instructions: 'Choose a card to gain (or none to skip):',
          cards: eligible_cards,
          minimum: 0,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Saboteur.gain_card)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> does not have any cards costing $3 or more in their deck`)
    }
    let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
    card_discarder.discard()
  }

  static gain_card(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
      card_gainer.gain_game_card()
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses not to gain anything`)
    }
  }

}
