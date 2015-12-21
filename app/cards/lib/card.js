Card = class Card {

  is_purchasable() {
    return true
  }

  potion_cost() {
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

  type_class() {
    return this.types().join(' ')
  }

  stack_name() {
    return this.name()
  }

  move_to_tavern(game, player_cards, name) {
    let reserve_index = _.findIndex(player_cards.playing, function(card) {
      return card.name === name
    })
    if (reserve_index !== -1) {
      let reserve_card = player_cards.playing.splice(reserve_index, 1)[0]
      delete reserve_card.prince
      if (reserve_card.misfit) {
        reserve_card = ClassCreator.create('Band Of Misfits').to_h()
      }
      player_cards.tavern.push(reserve_card)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(this)} on their Tavern`)
    }
  }

  to_h() {
    return {
      name: this.name(),
      image: this.image(),
      types: this.type_class(),
      coin_cost: this.coin_cost(),
      potion_cost: this.potion_cost(),
      purchasable: this.is_purchasable(),
      stack_name: this.stack_name()
    }
  }

}
