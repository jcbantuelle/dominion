BadOmens = class BadOmens extends Hex {

  receive(game, player_cards) {
    let card_mover = new CardMover(game, player_cards)
    card_mover.move_all(player_cards.deck, player_cards.discard)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts their deck into their discard pile`)

    let coppers = _.take(_.filter(player_cards.discard, function(card) {
      return card.name === 'Copper'
    }), 2)

    _.each(coppers, (copper) => {
      card_mover.move(player_cards.discard, player_cards.deck, copper)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(copper)} on their deck`)
    })
    if (_.size(coppers) < 2) {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal('discard')
    }
  }

}
