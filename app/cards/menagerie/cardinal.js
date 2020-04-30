Cardinal = class Cardinal extends Card {

  types() {
    return this.capitalism_types(['action', 'attack'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)
  }

  attack(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(2)

      let eligible_cards = _.filter(player_cards.revealed, function(card) {
        return CardCostComparer.coin_between(game, card, 3, 6)
      })
      if (_.size(eligible_cards) === 1) {
        Cardinal.exile_card(game, player_cards, eligible_cards)
      } else if (_.size(eligible_cards) > 1) {
        GameModel.update(game._id, game)
        PlayerCardsModel.update(game._id, player_cards)
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: `Choose a card to exile:`,
          cards: eligible_cards,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Cardinal.exile_card)
      }
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard()
    }
  }

  static exile_card(game, player_cards, selected_cards) {
    let card_mover = new CardMover(game, player_cards)
    card_mover.move(player_cards.revealed, player_cards.exile, selected_cards[0])
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> exiles ${CardView.render(selected_cards)}`)
  }

}
