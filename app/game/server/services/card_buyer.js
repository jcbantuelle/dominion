CardBuyer = class CardBuyer {

  constructor(game, player_cards, card_name) {
    this.game = game
    this.player_cards = player_cards
    this.game_card = this.find_game_card(card_name)
    this.card = ClassCreator.create(this.game_card.top_card.name)
    this.card_gainer = new CardGainer(this.game, this.player_cards, 'discard', this.card.name(), true)
    this.buy_event_cards = ['Noble Brigand']
  }

  find_game_card(card_name) {
    return _.find(this.game.cards, function(card) {
      return card.name === card_name
    })
  }

  buy() {
    if (this.can_buy()) {
      this.update_phase()
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
    this.update_log()
    this.track_bought_card()
    this.buy_event()
    this.gain_card()
    this.embargo()
  }

  update_turn() {
    this.game.turn.buys -= 1
    this.game.turn.coins -= this.game_card.top_card.coin_cost
    this.game.turn.potions -= this.game_card.top_card.potion_cost
  }

  track_bought_card(card) {
    let bought_card = _.clone(this.game_card.top_card)
    this.game.turn.bought_cards.push(bought_card)
  }

  buy_event() {
    if (_.contains(this.buy_event_cards, this.card.name())) {
      Games.update(this.game._id, this.game)
      this.card.buy_event(this)
    }
  }

  gain_card() {
    this.card_gainer.gain_game_card()
  }

  embargo() {
    _.times(this.game_card.embargos, () => {
      let card_gainer = new CardGainer(this.game, this.player_cards, 'discard', 'Curse')
      card_gainer.gain_game_card()
    })
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

  update_log() {
    let log_message = `&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> buys ${CardView.render(this.card)}`
    if (this.card_gainer.destination === 'hand') {
      log_message += ', placing it in hand'
    } else if (this.card_gainer.destination === 'deck') {
      log_message += ', placing it on top of their deck'
    }
    this.game.log.push(log_message)
  }

}
