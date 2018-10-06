PlayerCardsModel = class PlayerCardsModel extends ReactiveDictModel {
  static data_source(game_id) {
    return PlayerCards[game_id]
  }

  static find(game_id) {
    return _.mapValues(this.data_source(game_id).all())
  }

  static findOne(game_id, player_id) {
    return this.data_source(game_id).get(player_id)
  }

  static insert(record) {
    this.data_source(record.game_id).set(record.player_id, _.merge(record, {
      _id: Random.id(),
      discard: [],
      playing: [],
      in_play: [],
      revealed: [],
      duration: [],
      permanent: [],
      states: [],
      artifacts: [],
      boons: [],
      haven: [],
      gear: [],
      ghost: [],
      prince: [],
      princed: [],
      summon: [],
      native_village: [],
      island: [],
      encampments: [],
      archive: [],
      crypt: [],
      tavern: [],
      save: [],
      horse_traders: [],
      saved_boons: [],
      faithful_hounds: [],
      pirate_ship_coins: 0,
      victory_tokens: 0,
      debt_tokens: 0,
      champions: 0,
      last_turn_gained_cards: [],
      possession_trash: [],
      to_discard: [],
      discarding: [],
      trash: [],
      trashing: [],
      duration_effects: [],
      permanent_duration_effects: [],
      duration_attacks: [],
      estate: []
    }))
    return record.player_id
  }

  static update(game_id, record) {
    return this.data_source(game_id).set(record.player_id, record)
  }

  static remove(game_id, player_id) {
    if (game_id) {
      if (player_id) {
        this.data_source(game_id).delete(player_id)
      } else {
        this.data_source(game_id).clear()
      }
    } else {
      PlayerCards = {}
    }
  }
}
