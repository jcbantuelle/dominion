ClientClassCreator = class ClientClassCreator {

  static create(class_name) {
    if (class_name === 'Tracker') {
      class_name += 'Card'
    }
    if (_.includes(class_name, '/')) {
      class_name = _.split(class_name, '/')[0]
    }
    let created_class = function() { 
      return new window[_.titleize(class_name)]
    }
    return created_class()
  }

}
