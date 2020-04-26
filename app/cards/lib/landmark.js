Landmark = class Landmark {

  name() {
    return _.startCase(this.constructor.name)
  }

  image() {
    return _.snakeCase(this.constructor.name)
  }

  type_class() {
    return 'landmark'
  }

  inherited_name() {
    return this.name()
  }

  victory_points() {
    return 0
  }

  point_variable() {
    return false
  }

  to_h() {
    return {
      name: this.name(),
      inherited_name: this.inherited_name(),
      image: this.image(),
      wide: true,
      types: 'landmark',
      victory_tokens: 0
    }
  }
}
