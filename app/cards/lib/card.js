Card = class Card {

  potion_cost() {
    return 0
  }

  to_h() {
    return {
      name: s.humanize(this.constructor.name),
      image: s.underscored(this.constructor.name),
      types: this.types().join(' '),
      coin_cost: this.coin_cost(),
      potion_cost: this.potion_cost()
    }
  }
}
