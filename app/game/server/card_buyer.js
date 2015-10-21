CardBuyer = class CardBuyer {

  constructor(card_name) {
    this.game = Games.findOne(Meteor.user().current_game)
    this.find_game_card(card_name)
    this.card = ClassCreator.create(this.game_card.top_card.name)
    this.player_cards = PlayerCards.findOne({
      player_id: Meteor.userId(),
      game_id: this.game._id
    })
  }

  find_game_card(card_name) {
    this.game_card_index = _.findIndex(this.game.kingdom_cards, function(card) {
      return card.name === card_name
    })

    if (this.game_card_index === -1) {
      this.game_card_index = _.findIndex(this.game.common_cards, function(card) {
        return card.name === card_name
      })
      this.game_card_type = 'common'
      this.game_card = this.game.common_cards[this.game_card_index]
    } else {
      this.game_card_type = 'kingdom'
      this.game_card = this.game.kingdom_cards[this.game_card_index]
    }
  }

  buy() {
    if (this.can_buy()) {
      this.update_phase()
      this.buy_card()
      this.update_log()
      Games.update(this.game._id, this.game)
      PlayerCards.update(this.player_cards._id, this.player_cards)
    }
  }

  can_buy() {
    return this.is_player_turn() && this.is_purchasable() && this.is_valid_buy()
  }

  update_phase() {
    if (_.contains(['action', 'treasure'], this.game.turn.phase)) {
      this.game.turn.phase = 'buy'
    }
  }

  buy_card() {
    this.update_turn()
    this.move_card_to_discard()
  }

  update_turn() {
    this.game.turn.buys -= 1
    this.game.turn.coins -= this.game_card.top_card.coin_cost
    this.game.turn.potions -= this.game_card.top_card.potion_cost
  }

  move_card_to_discard() {
    this.game_card.stack.shift()
    this.player_cards.discard.push(this.game_card.top_card)
    this.game_card.count -= 1
    this.game_card.top_card = _.first(this.game_card.stack)
    if (this.game_card_type === 'kingdom') {
      this.game.kingdom_cards.splice(this.game_card_index, 1, this.game_card)
    } else if (this.game_card_type === 'common') {
      this.game.common_cards.splice(this.game_card_index, 1, this.game_card)
    }
  }

  update_log() {
    this.game.log.push(`${Meteor.user().username} buys <span class="${this.game_card.top_card.types}">${this.game_card.top_card.name}</span>`)
  }

  is_player_turn() {
    return this.game.turn.player._id == Meteor.userId()
  }

  is_purchasable() {
    return this.card.is_purchasable()
  }

  is_valid_buy() {
    return this.has_remaining_stock() && this.has_enough_buys() && this.has_enough_money()
  }

  has_remaining_stock() {
    return this.game_card.count > 0
  }

  has_enough_buys() {
    return this.game.turn.buys > 0
  }

  has_enough_money() {
    return this.game.turn.coins >= this.game_card.top_card.coin_cost && this.game.turn.potions >= this.game_card.top_card.potion_cost
  }

}
