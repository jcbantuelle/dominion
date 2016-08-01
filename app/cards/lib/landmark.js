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

  to_h() {
    return {
      name: this.name(),
      inherited_name: this.inherited_name(),
      image: this.image(),
      types: 'landmark',
      victory_tokens: 0
    }
  }
}
