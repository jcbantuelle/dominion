ClassCreator = class ClassCreator {

  static create(class_name) {
    let created_class = function() { return new this[_.titleize(class_name)] }
    return created_class()
  }

}
