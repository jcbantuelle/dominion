PlayerAttacker = class PlayerAttacker {

  constructor(game, card, card_player) {
    this.game = game
    this.card = card
    this.card_player = card_player
  }

  attack(attacker_player_cards, params) {
    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(this.game, attacker_player_cards)
    ordered_player_cards.shift()

    GameModel.update(this.game._id, this.game)

    _.each(ordered_player_cards, (attacked_player_cards) => {
      if (attacked_player_cards.moat || attacked_player_cards.champions > 0 || this.lighthouse_in_play(attacked_player_cards)) {
        delete attacked_player_cards.moat
        this.game.log.push(`&nbsp;&nbsp;<strong>${attacked_player_cards.username}</strong> is immune to the attack`)
      } else {
        this.card.attack(this.game, attacked_player_cards, attacker_player_cards, this.card_player, params)
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
