Project = class Project {

  name() {
    return _.startCase(this.constructor.name)
  }

  image() {
    return _.snakeCase(this.constructor.name)
  }

  debt_cost() {
    return 0
  }

  type_class() {
    return 'project'
  }

  buy(game, player_cards) {
  }

  to_h() {
    return {
      name: this.name(),
      image: this.image(),
      types: 'project',
      wide: true,
      coin_cost: this.coin_cost(),
      debt_cost: this.debt_cost()
    }
  }
}
