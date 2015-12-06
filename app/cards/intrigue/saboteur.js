Saboteur = class Saboteur extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    this.all_player_cards = PlayerCardsModel.find(game._id)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)
  }

  attack(game, player_cards) {
    this.reveal(game, player_cards)

    if (player_cards.trashed_card) {
      let card_trasher = new CardTrasher(game, player_cards, 'revealed', player_cards.trashed_card.name)
      card_trasher.trash()
      GameModel.update(game._id, game)

      let eligible_cards = _.filter(game.cards, function(card) {
        let coin_cost = CostCalculator.calculate(game, card.top_card, this.all_player_cards)
        return card.count > 0 && card.top_card.purchasable && coin_cost <= (player_cards.trashed_card_coin_cost - 2) && card.top_card.potion_cost <= player_cards.trashed_card.potion_cost
      })
      if (_.size(eligible_cards) > 0) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          game_cards: true,
          instructions: 'Choose a card to gain (Or none to skip):',
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
    delete player_cards.trashed_card
    delete player_cards.trashed_card_coin_cost

    let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
    card_discarder.discard()
  }

  reveal(game, player_cards) {
    while((_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) && !player_cards.trashed_card) {
      if (_.size(player_cards.deck) === 0) {
        DeckShuffler.shuffle(player_cards)
      }
      let card = player_cards.deck.shift()
      let coin_cost = CostCalculator.calculate(game, card, this.all_player_cards)
      player_cards.revealed.push(card)
      if (coin_cost > 2) {
        player_cards.trashed_card = card
        player_cards.trashed_card_coin_cost = coin_cost
      }
    }
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.revealed)}`)
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
