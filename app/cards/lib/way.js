Way = class Way {

  name() {
    return _.startCase(this.constructor.name)
  }

  image() {
    return _.snakeCase(this.constructor.name)
  }

  type_class() {
    return 'way'
  }

  to_h() {
    return {
      name: this.name(),
      image: this.image(),
      wide: true,
      types: 'way'
    }
  }
}
