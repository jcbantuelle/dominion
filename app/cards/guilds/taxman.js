Taxman = class Taxman extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let eligible_cards = _.filter(player_cards.hand, function(card) {
      return _.includes(_.words(card.types), 'treasure')
    })
    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a treasure to trash (Or none to skip):',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Taxman.trash_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not trash anything`)
    }

    GameModel.update(game._id, game)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)

    if (game.turn.taxman_trash) {
      let eligible_cards = _.filter(game.cards, function(card) {
        return card.count > 0 && card.top_card.purchasable && _.includes(_.words(card.top_card.types), 'treasure') && CardCostComparer.card_less_than(game, game.turn.taxman_trash, card.top_card, 4)
      })

      if (_.size(eligible_cards) > 0) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          game_cards: true,
          instructions: 'Choose a card to gain:',
          cards: eligible_cards,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Taxman.gain_card)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no available treasures to gain`)
      }
    }

    delete game.turn.taxman_trash
  }

  attack(game, player_cards) {
    if (game.turn.taxman_trash) {

      let treasure_to_discard = _.find(player_cards.hand, (card) => {
        card.name === game.turn.taxman_trash.name
      })

      if (treasure_to_discard) {
        let card_discarder = new CardDiscarder(game, player_cards, 'hand', treasure_to_discard)
        card_discarder.discard()
      } else {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.hand)}`)
      }
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      game.turn.taxman_trash = selected_cards[0]

      let card_trasher = new CardTrasher(game, player_cards, 'hand', game.turn.taxman_trash)
      card_trasher.trash()
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'deck', selected_cards[0].name)
    card_gainer.gain()
  }

}
