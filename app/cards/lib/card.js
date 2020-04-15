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

  move_to_tavern(game, player_cards, reserve_card) {
    let reserve_index = _.findIndex(player_cards.playing, function(card) {
      return card.id === reserve_card.id
    })
    if (reserve_index !== -1) {
      let reserve_card = player_cards.playing.splice(reserve_index, 1)[0]
      delete reserve_card.prince
      if (reserve_card.misfit) {
        reserve_card = reserve_card.misfit
      }
      player_cards.tavern.push(reserve_card)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(reserve_card)} on their Tavern`)
    }
  }

  stay_in_play(game, player_cards, card) {
    let stay_in_play = false
    if (card.belongs_to_id) {
      let belongs_to = _.find(player_cards.in_play, (in_play_card) => {
        return in_play_card.id === card.belongs_to_id
      })
      if (belongs_to) {
        stay_in_play = ClassCreator.create(belongs_to.name).stay_in_play(game, player_cards, belongs_to)
      }
    }
    if (!stay_in_play) {
      delete card.belongs_to_id
    }
    return stay_in_play
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
