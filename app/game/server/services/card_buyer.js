CardBuyer = class CardBuyer {

  constructor(game, player_cards, card_name) {
    this.game = game
    this.player_cards = player_cards
    this.find_game_card(card_name)
    this.card = ClassCreator.create(this.game_card.top_card.name)
  }

  find_game_card(card_name) {
    _.each(['kingdom', 'common'], (source) => {
      let card_index = _.findIndex(this.game[`${source}_cards`], function(card) {
        return card.name === card_name
      })
      if (card_index !== -1) {
        this.game_card = this.game[`${source}_cards`][card_index]
      }
    })
  }

  buy() {
    if (this.can_buy()) {
      this.update_phase()
      this.update_log()
      this.buy_card()
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
    this.gain_card()
  }

  update_turn() {
    this.game.turn.buys -= 1
    this.game.turn.coins -= this.game_card.top_card.coin_cost
    this.game.turn.potions -= this.game_card.top_card.potion_cost
  }

  gain_card() {
    let card_gainer = new CardGainer(this.game, this.player_cards.username, this.player_cards.discard, this.card.name())
    card_gainer[`gain_${this.game_card.source}_card`](false)
  }

  update_log() {
    this.game.log.push(`<strong>${Meteor.user().username}</strong> buys ${CardView.render(this.game_card.top_card)}`)
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
