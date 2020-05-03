Card = class Card {

  constructor(game) {
    this.game = game
  }

  capitalism_types(current_types) {
    if (this.game) {
      let player_cards = PlayerCardsModel.findOne(this.game._id, this.game.turn.player._id)
      if (player_cards.capitalism) {
        current_types.push('treasure')
      }
    }
    return current_types
  }

  capitalism() {
    return false
  }

  alternate_buy() {
    return false
  }

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

  pile_types() {
    return this.types()
  }

  destination() {
    return false
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
      pile_types: this.pile_types().join(' '),
      coin_cost: this.coin_cost(),
      potion_cost: this.potion_cost(),
      debt_cost: this.debt_cost(),
      stack_name: this.stack_name(),
      capitalism: this.capitalism(),
      alternate_buy: this.alternate_buy()
    }
  }

}
