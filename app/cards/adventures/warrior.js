Warrior = class Warrior extends Traveller {

  is_purchasable() {
    false
  }

  types() {
    return ['action', 'attack', 'traveller']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)

    game.turn.traveller_count = _.size(_.filter(player_cards.in_play.concat(player_cards.playing), function(card) {
      return _.contains(_.words(card.types), 'traveller')
    }))

    this.all_player_cards = PlayerCardsModel.find(game._id)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)

    delete game.turn.traveller_count
  }

  attack(game, player_cards) {
    _.times(game.turn.traveller_count, function() {
      if (_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) {
        if (_.size(player_cards.deck) === 0) {
          DeckShuffler.shuffle(game, player_cards)
        }
        let revealed_card = player_cards.deck.shift()
        player_cards.revealed.push(revealed_card)

        let revealed_cost = CostCalculator.calculate(game, revealed_card, this.all_player_cards)
        if (revealed_cost >= 3 && revealed_cost <= 4 && revealed_card.potion_cost === 0) {
          let card_trasher = new CardTrasher(game, player_cards, 'revealed', revealed_card.name)
          card_trasher.trash()
        } else {
          let card_discarder = new CardDiscarder(game, player_cards, 'revealed', revealed_card.name)
          card_discarder.discard()
        }
      }
    })
  }

  discard_event(discarder) {
    this.choose_exchange(discarder.game, discarder.player_cards, 'Warrior', 'Hero')
  }

}