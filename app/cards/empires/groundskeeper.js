Groundskeeper = class Groundskeeper extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)
  }


  gain_event(gainer, groundskeeper) {
    if (_.includes(_.words(this.gained_card.types), 'victory')) {
      let groundskeeper_count = _.size(_.filter(this.player_cards.in_play, function(card) {
        return card.name === 'Groundskeeper'
      }))
      if (groundskeeper_count > 0) {
        if (this.game.turn.possessed) {
          possessing_player_cards = PlayerCardsModel.findOne(this.game._id, this.game.turn.possessed._id)
          possessing_player_cards.victory_tokens += groundskeeper_count
          this.game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> gets +${groundskeeper_count} &nabla; from ${CardView.render(new Groundskeeper())}`)
          PlayerCardsModel.update(this.game._id, possessing_player_cards)
        } else {
          this.player_cards.victory_tokens += groundskeeper_count
          this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> gets +${groundskeeper_count} &nabla; from ${CardView.render(new Groundskeeper())}`)
        }
      }
    }
  }

}
