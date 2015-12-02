TurnEventModel = class TurnEventModel extends ReactiveDictModel {

  static data_source(game_id) {
    return TurnEvents[game_id]
  }

  static find(game_id) {
    return _.mapValues(this.data_source(game_id).all())
  }

  static findOne(game_id, turn_event_id) {
    return this.data_source(game_id).get(turn_event_id)
  }

  static insert(record) {
    let turn_event_id = Random.id()

    this.data_source(record.game_id).set(turn_event_id, _.merge(record, {_id: turn_event_id}))
    return turn_event_id
  }

  static update(game_id, record) {
    return this.data_source(game_id).set(record._id, record)
  }

  static remove(game_id, turn_event_id) {
    if (game_id) {
      if (turn_event_id) {
        this.data_source(game_id).delete(turn_event_id)
      } else {
        this.data_source(game_id).clear()
      }
    } else {
      TurnEvents = {}
    }
  }

}
