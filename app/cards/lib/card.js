Card = class Card {

  potion_cost() {
    return 0
  }

  name() {
    return s.humanize(this.constructor.name)
  }

  image() {
    return s.underscored(this.constructor.name)
  }

  type_class() {
    return this.types().join(' ')
  }

  to_h() {
    return {
      name: this.name(),
      image: this.image(),
      types: this.type_class(),
      coin_cost: this.coin_cost(),
      potion_cost: this.potion_cost()
    }
  }
}
