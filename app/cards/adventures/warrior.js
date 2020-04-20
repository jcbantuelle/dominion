Warrior = class Warrior extends Traveller {

  types() {
    return ['action', 'attack', 'traveller']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)

    let traveller_count = _.size(_.filter(player_cards.in_play, function(card) {
      return _.includes(_.words(card.types), 'traveller')
    }))

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards, traveller_count)
  }

  attack(game, player_cards, attacker_player_cards, card_player, traveller_count) {
    _.times(traveller_count, function() {
      if (_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) {
        if (_.size(player_cards.deck) === 0) {
          let deck_shuffler = new DeckShuffler(game, player_cards)
          deck_shuffler.shuffle()
        }
        let discarded_card = player_cards.deck[0]
        let card_discarder = new CardDiscarder(game, player_cards, 'deck', discarded_card)
        card_discarder.discard()

        if (CardCostComparer.coin_between(game, discarded_card, 3, 4)) {
          let card_trasher = new CardTrasher(game, player_cards, 'discard', discarded_card)
          card_trasher.trash()
        }
      } else {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards left in their deck`)
        return false
      }
    })
  }

  discard_event(discarder, warrior) {
    this.choose_exchange(discarder.game, discarder.player_cards, warrior, 'Hero')
  }

}
