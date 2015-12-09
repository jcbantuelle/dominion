FortuneTeller = class FortuneTeller extends Card {

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
    player_attacker.attack(player_cards)
  }

  attack(game, player_cards) {
    this.reveal(game, player_cards)

    if (player_cards.top_card) {
      player_cards.deck.unshift(player_cards.top_card)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(player_cards.top_card)} on top of their deck`)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> does not have any victory or curse cards in their deck`)
    }
    delete player_cards.top_card

    let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
    card_discarder.discard()
  }

  reveal(game, player_cards) {
    let revealed_cards = []
    while((_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) && !player_cards.top_card) {
      if (_.size(player_cards.deck) === 0) {
        DeckShuffler.shuffle(game, player_cards)
      }
      let card = player_cards.deck.shift()
      revealed_cards.push(card)
      if (_.contains(_.words(card.types), 'victory') || _.contains(card.types, 'curse')) {
        player_cards.top_card = card
      } else {
        player_cards.revealed.push(card)
      }
    }
    if (!_.isEmpty(revealed_cards)) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(revealed_cards)}`)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in their deck`)
    }
  }

}
