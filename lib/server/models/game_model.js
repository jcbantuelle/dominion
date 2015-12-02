GameModel = class GameModel extends ReactiveDictModel {
  static data_source() {
    return Games
  }

  static insert(record) {
    let game_id = Random.id()
    TurnEvents[game_id] = new ReactiveDict()
    this.data_source().set(game_id, _.merge(record, {
      _id: game_id,
      trash: [],
      trade_route_tokens: 0,
      log: [],
      turn_number: 1,
      extra_turns: []
    }))
    return game_id
  }
}
