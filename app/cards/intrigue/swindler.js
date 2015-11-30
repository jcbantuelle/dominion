Swindler = class Swindler extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    game.turn.coins += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$2`)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack()
  }

  attack(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      if (_.size(player_cards.deck) === 0) {
        DeckShuffler.shuffle(player_cards)
      }

      let all_player_cards = PlayerCards.find({
        game_id: game._id
      }).fetch()

      let top_card = player_cards.deck.shift()
      player_cards.revealed.push(top_card)

      let top_card_coin_cost = CostCalculator.calculate(game, top_card, all_player_cards)
      let top_card_potion_cost = top_card.potion_cost

      let card_trasher = new CardTrasher(game, player_cards, 'revealed', top_card.name)
      card_trasher.trash()

      GameModel.update(game._id, game)

      let eligible_cards = _.filter(game.cards, function(card) {
        let coin_cost = CostCalculator.calculate(game, card.top_card, all_player_cards)
        return card.count > 0 && card.top_card.purchasable && coin_cost === top_card_coin_cost && card.top_card.potion_cost === top_card_potion_cost
      })

      if (_.size(eligible_cards) > 0) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: game.turn.player._id,
          username: game.turn.player.username,
          type: 'choose_cards',
          game_cards: true,
          instructions: `Choose a card for ${player_cards.username} to gain:`,
          cards: eligible_cards,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Swindler.gain_card)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
      }
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain_game_card()
  }

}
