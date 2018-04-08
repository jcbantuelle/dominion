Hex = class Hex {

  name() {
    return _.startCase(this.constructor.name)
  }

  image() {
    return _.snakeCase(this.constructor.name)
  }

  type_class() {
    return 'hex'
  }

  to_h() {
    return {
      name: this.name(),
      image: this.image(),
      types: 'hex'
    }
  }
}
