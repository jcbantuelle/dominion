TurnEventModel = class TurnEventModel extends ReactiveDictModel {
  static data_source() {
    return TurnEvents
  }

  static insert(record) {
    return super.insert(record, record.game_id)
  }
}
