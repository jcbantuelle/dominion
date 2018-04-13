CursedVillage = class CursedVillage extends Card {

  types() {
    return ['action', 'doom']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    game.turn.actions += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions`)

    if (_.size(player_cards.hand) >= 6) {
      game.log.push(`&nbsp;&nbsp;but ${player_cards.username} already has 6 cards in hand`)
    } else if (_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) {
      if (player_cards.tokens.minus_card) {
        this.game.log.push(`&nbsp;&nbsp;${this.player_cards.username} discards their -1 card token`)
        delete this.player_cards.tokens.minus_card
      }
      CursedVillage.draw_cards(game, player_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards to draw`)
    }
  }

  static draw_cards(game, player_cards) {
    if (_.size(player_cards.hand) >= 6 || (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0)) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> draws up to ${_.size(player_cards.hand)} cards`)
    } else {
      if (_.size(player_cards.deck) === 0) {
        DeckShuffler.shuffle(game, player_cards)
      }
      player_cards.hand.push(player_cards.deck.shift())
      CursedVillage.draw_cards(game, player_cards)
    }
  }

  gain_event(gainer) {
    let hex_receiver = new EffectReceiver(gainer.game, gainer.player_cards, 'hex')
    hex_receiver.receive()
  }

}
