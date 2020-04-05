BadOmens = class BadOmens extends Hex {

  receive(game, player_cards) {
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts their deck into their discard pile`)
    player_cards.discard = player_cards.discard.concat(player_cards.deck)
    player_cards.deck = []

    this.coppers = []
    this.find_copper(player_cards)
    if (_.size(this.coppers) > 0) {
      this.find_copper(player_cards)
    }

    if (_.size(this.coppers) > 0) {
      player_cards.deck = this.coppers
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${_.size(player_cards.deck)} ${CardView.render(new Copper())} on their deck`)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.discard)}`)
    }
  }

  find_copper(player_cards) {
    let copper_index = _.findIndex(player_cards.discard, function(card) {
      return card.name === 'Copper'
    })

    if (copper_index !== -1) {
      this.coppers.push(player_cards.discard.splice(copper_index, 1)[0])
    }
  }

}
