ReactiveDictModel = class ReactiveDictModel {

  static find() {
    return this.data_source().all()
  }

  static findOne(id) {
    return this.data_source().get(id)
  }

  static insert(record, id) {
    id = id ? id : Random.id()
    this.data_source().set(id, _.merge(record, {_id: id}))
    return id
  }

  static update(id, record) {
    return this.data_source().set(id, record)
  }

  static remove(id) {
    if (id) {
      this.data_source().delete(id)
    } else {
      this.data_source().clear()
    }
  }
}
