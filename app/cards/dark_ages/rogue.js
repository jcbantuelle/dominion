Rogue = class Rogue extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2)

    let eligible_cards = _.filter(game.trash, function(card) {
      return CardCostComparer.coin_between(game, card, 3, 6)
    })

    if (_.size(eligible_cards) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to gain:',
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Rogue.gain_from_trash)
    } else if (_.size(eligible_cards) === 1) {
      Rogue.gain_from_trash(game, player_cards, eligible_cards)
    } else {
      game.turn.rogue_attack = true
    }

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)

    delete game.turn.rogue_attack
  }

  static gain_from_trash(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain(game.trash)
  }

  attack(game, player_cards) {
    if (game.turn.rogue_attack) {
      if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
      } else {
        let card_revealer = new CardRevealer(game, player_cards)
        card_revealer.reveal_from_deck(2)

        GameModel.update(game._id, game)
        PlayerCardsModel.update(game._id, player_cards)

        let eligible_cards = _.filter(player_cards.revealed, function(card) {
          return CardCostComparer.coin_between(game, card, 3, 6)
        })
        if (_.size(eligible_cards) === 1) {
          Rogue.trash_revealed(game, player_cards, eligible_cards)
        } else if (_.size(eligible_cards) > 1) {
          let turn_event_id = TurnEventModel.insert({
            game_id: game._id,
            player_id: player_cards.player_id,
            username: player_cards.username,
            type: 'choose_cards',
            player_cards: true,
            instructions: `Choose a card to trash:`,
            cards: eligible_cards,
            minimum: 1,
            maximum: 1
          })
          let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
          turn_event_processor.process(Rogue.trash_revealed)
        }
        let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
        card_discarder.discard()
      }
    }
  }

  static trash_revealed(game, player_cards, selected_cards) {
    let card_trasher = new CardTrasher(game, player_cards, 'revealed', selected_cards)
    card_trasher.trash()
  }

}
