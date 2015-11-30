PlayerCardsModel = class PlayerCardsModel extends MongoModel {
  static data_source() {
    return PlayerCards
  }

  static insert(record) {
    return super.insert(_.merge(record, {
      discard: [],
      playing: [],
      in_play: [],
      revealed: [],
      duration: [],
      haven: [],
      native_village: [],
      island: [],
      pirate_ship_coins: 0,
      victory_tokens: 0,
      last_turn_gained_cards: [],
      possession_trash: []
    }))
  }
}
