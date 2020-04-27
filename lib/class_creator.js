ClassCreator = class ClassCreator {

  static create(class_name) {
    if (class_name === 'Tracker') {
      class_name += 'Card'
    }
    let created_class = function() { return new global[_.titleize(class_name)] }
    return created_class()
  }

}
