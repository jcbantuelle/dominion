Event = class Event {

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
    return 'event'
  }

  to_h() {
    return {
      name: this.name(),
      image: this.image(),
      types: 'event',
      wide: true,
      coin_cost: this.coin_cost(),
      debt_cost: this.debt_cost()
    }
  }
}
