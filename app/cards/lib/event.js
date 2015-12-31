Event = class Event {

  name() {
    return _.startCase(this.constructor.name)
  }

  image() {
    return _.snakeCase(this.constructor.name)
  }

  type_class() {
    return 'event'
  }

  to_h() {
    return {
      name: this.name(),
      image: this.image(),
      types: 'event',
      coin_cost: this.coin_cost()
    }
  }
}
