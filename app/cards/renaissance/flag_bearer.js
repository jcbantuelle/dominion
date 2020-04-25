FlagBearer = class FlagBearer extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2)
  }

  gain_event(gainer, flag_bearer) {
    this.take_flag(gainer.game, gainer.player_cards)
  }

  trash_event(trasher, flag_bearer) {
    this.take_flag(trasher.game, trasher.player_cards)
  }

  take_flag(game, player_cards) {
    this.source = player_cards.artifacts
    let flag = this.find_flag()

    if (!flag) {
      this.source = game.artifacts
      flag = this.find_flag()
      if (!flag) {
        let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, player_cards)
        ordered_player_cards.shift()
        _.each(ordered_player_cards, (next_player_cards) => {
          this.next_player_cards = next_player_cards
          this.source = next_player_cards.artifacts
          flag = this.find_flag()
          if (flag) {
            return false
          }
        })
      }
      let card_mover = new CardMover(game, player_cards)
      card_mover.move(this.source, player_cards.artifacts, flag)
      if (this.next_player_cards) {
        PlayerCardsModel.update(game._id, this.next_player_cards)
      }
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> takes ${CardView.render(flag)}`)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> already has ${CardView.render(flag)}`)
    }
  }

  find_flag() {
    return _.find(this.source, (artifact) => {
      return artifact.name === 'Flag'
    })
  }

}
