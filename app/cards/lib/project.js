Project = class Project {

  name() {
    return _.startCase(this.constructor.name)
  }

  image() {
    return _.snakeCase(this.constructor.name)
  }

  type_class() {
    return 'project'
  }

  to_h() {
    return {
      name: this.name(),
      image: this.image(),
      types: 'project',
      wide: true,
      cubes: [],
      coin_cost: this.coin_cost()
    }
  }
}
