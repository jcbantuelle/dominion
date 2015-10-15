Card = class Card {

  to_h() {
    return {
      name: s.humanize(this.constructor.name),
      types: this.types().join(' ')
    }
  }
}
