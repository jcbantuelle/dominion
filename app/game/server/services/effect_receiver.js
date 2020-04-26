EffectReceiver = class EffectReceiver {

  constructor(game, player_cards, effect) {
    this.game = game
    this.player_cards = player_cards
    if (effect === 'boon') {
      this.effect_deck = this.game.boons_deck
      this.effect_discard = this.game.boons_discard
      this.player_effects = this.player_cards.boons
    } else if (effect === 'hex') {
      this.effect_deck = this.game.hexes_deck
      this.effect_discard = this.game.hexes_discard
      this.player_effects = this.player_cards.hexes
    }
  }

  receive() {
    if (_.size(this.effect_deck) === 0) {
      this.shuffle_deck()
    }

    let received_effect = this.effect_deck.shift()
    this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> receives ${CardView.render(received_effect)}`)
    GameModel.update(this.game._id, this.game)
    let player_keeps_effect = this.effect(received_effect).receive(this.game, this.player_cards)

    this.discard_effect(received_effect, player_keeps_effect)
    return received_effect
  }

  shuffle_deck() {
    this.effect_deck = _.shuffle(this.effect_discard)
    this.effect_discard = []
  }

  effect(effect_card) {
    return ClassCreator.create(effect_card.name)
  }

  discard_effect(effect_card, keep_effect) {
    if (keep_effect) {
      this.player_effects.push(effect_card)
    } else {
      this.effect_discard.unshift(effect_card)
    }
  }
}
