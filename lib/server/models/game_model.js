GameModel = class GameModel extends DataModel {
  static data_source() {
    return Games
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
