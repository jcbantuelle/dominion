PlayerAttacker = class PlayerAttacker {

  constructor(game, card) {
    this.game = game
    this.card = card
  }

  attack(attacker) {
    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(this.game)
    ordered_player_cards.shift()

    GameModel.update(this.game._id, this.game)

    _.each(ordered_player_cards, (attacked_player_cards) => {
      let attack_event_processor = new AttackEventProcessor(this.game, attacked_player_cards)
      attack_event_processor.process()

      if (attacked_player_cards.moat || attacked_player_cards.champion || this.lighthouse_in_play(attacked_player_cards)) {
        delete attacked_player_cards.moat
        this.game.log.push(`&nbsp;&nbsp;<strong>${attacked_player_cards.username}</strong> is immune to the attack`)
      } else {
        this.card.attack(this.game, attacked_player_cards, attacker)
      }
      GameModel.update(this.game._id, this.game)
      PlayerCardsModel.update(this.game._id, attacked_player_cards)
    })
  }

  lighthouse_in_play(player_cards) {
    return _.some(player_cards.in_play, function(card) {
      return _.includes(['Lighthouse', 'Guardian'], card.name)
    })
  }
}
