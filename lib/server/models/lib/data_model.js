DataModel = class DataModel {

  static find() {
    return this.data_source().find()
  }

  static findOne(id, args = {}) {
    return this.data_source().findOne(id, args)
  }

  static insert(record) {
    return this.data_source().insert(record)
  }

  static update(id, record) {
    return this.data_source().update(id, record)
  }

  static remove(id = {}) {
    return this.data_source().remove(id)
  }
}
