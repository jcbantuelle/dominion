TurnEventModel = class TurnEventModel extends DataModel {
  static data_source() {
    return TurnEvents
  }

  static insert(record) {
    return super.insert(_.merge(record, {
      trash: [],
      trade_route_tokens: 0,
      log: [],
      turn_number: 1,
      extra_turns: []
    }))
  }
}
