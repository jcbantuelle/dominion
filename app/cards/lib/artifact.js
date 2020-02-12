Artifact = class Artifact {

  name() {
    return _.startCase(this.constructor.name)
  }

  image() {
    return _.snakeCase(this.constructor.name)
  }

  type_class() {
    return 'artifact'
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
      image: this.image(),
      types: 'artifact'
    }
  }
}
