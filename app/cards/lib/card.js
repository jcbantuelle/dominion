Card = class Card {

  potion_cost() {
    return 0
  }

  debt_cost() {
    return 0
  }

  victory_points() {
    return 0
  }

  point_variable() {
    return false
  }

  name() {
    return _.startCase(this.constructor.name)
  }

  image() {
    return _.snakeCase(this.constructor.name)
  }

  stack_name() {
    return this.name()
  }

  type_class() {
    return this.types().join(' ')
  }

  destination() {
    return false
  }

  static move_to_tavern(game, player_cards, reserve_card) {
    let card_mover = new CardMover(game, player_cards)
    if (card_mover.move(player_cards.in_play, player_cards.tavern, reserve_card)) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(reserve_card)} on their Tavern`)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>but ${CardView.render(reserve_card)} is not in play`)
    }
  }

  static call_from_tavern(game, player_cards, reserve_card) {
    let card_mover = new CardMover(game, player_cards)
    card_mover.move(player_cards.tavern, player_cards.in_play, reserve_card)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> calls ${CardView.render(reserve_card)} from their Tavern`)
  }

  stay_in_play(game, player_cards, card) {
    _.each(card.belongs_to, (belongs_to, i) => {
      if (belongs_to.expect_in_play) {
        let still_in_play = _.find(player_cards.in_play, (in_play_card) => {
          return in_play_card.id === belongs_to.id
        })
        if (!still_in_play) {
          delete card.belongs_to[i]
          return false
        }
      }
      let stay_in_play = ClassCreator.create(belongs_to.name).stay_in_play(game, player_cards, belongs_to)
      if (!stay_in_play) {
        delete card.belongs_to[i]
      }
    })
    card.belongs_to = _.compact(card.belongs_to)

    return !_.isEmpty(card.belongs_to)
  }

  to_h(player_cards) {
    return {
      name: this.name(),
      image: this.image(),
      types: this.types().join(' '),
      coin_cost: this.coin_cost(),
      potion_cost: this.potion_cost(),
      debt_cost: this.debt_cost(),
      stack_name: this.stack_name()
    }
  }

}
