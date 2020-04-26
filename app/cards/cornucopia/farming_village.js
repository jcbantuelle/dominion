FarmingVillage = class FarmingVillage extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(2)

    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal_from_deck_until((game, player_cards, revealed_cards) => {
      if (!_.isEmpty(revealed_cards)) {
        return _.includes(_.words(_.last(revealed_cards).types), 'action') || _.includes(_.words(_.last(revealed_cards).types), 'treasure')
      } else {
        return false
      }
    })

    let last_revealed = _.last(player_cards.revealed)
    if (_.includes(_.words(last_revealed.types), 'action') || _.includes(_.words(last_revealed.types), 'treasure')) {
      let card_mover = new CardMover(game, player_cards)
      card_mover.move(player_cards.revealed, player_cards.hand, last_revealed)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(last_revealed)} in their hand`)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no action or treasure cards in their deck`)
    }

    let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
    card_discarder.discard()
  }

}
