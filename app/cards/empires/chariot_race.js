ChariotRace = class ChariotRace extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    let current_player_card_revealer = new CardRevealer(game, player_cards)
    current_player_card_revealer.reveal_from_deck(1)
    let current_player_card = player_cards.revealed[0]
    if (current_player_card) {
      let card_mover = new CardMover(game, player_cards)
      card_mover.move(player_cards.revealed, player_cards.hand, current_player_card)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(current_player_card)} in hand`)
    }

    let next_player_query = new NextPlayerQuery(game, player_cards.player_id)
    let next_player_cards = PlayerCardsModel.findOne(game._id, next_player_query.next_player()._id)
    let next_player_card_revealer = new CardRevealer(game, next_player_cards)
    next_player_card_revealer.reveal_from_deck(1)
    let next_player_card = next_player_cards.revealed[0]
    if (next_player_card) {
      let card_mover = new CardMover(game, next_player_cards)
      card_mover.move(next_player_cards.revealed, next_player_cards.deck, next_player_card)
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, next_player_cards)
    }

    if (current_player_card && (!next_player_card || CardCostComparer.card_less_than(game, current_player_card, next_player_card))) {
      let coin_gainer = new CoinGainer(game, player_cards)
      coin_gainer.gain(1)

      let victory_token_gainer = new VictoryTokenGainer(game, player_cards)
      victory_token_gainer.gain(1)
    }
  }

}
