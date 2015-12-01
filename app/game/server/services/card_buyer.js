CardBuyer = class CardBuyer {

  constructor(game, player_cards, card_name) {
    this.game = game
    this.player_cards = player_cards
    this.game_card = this.find_game_card(card_name)
    this.card = ClassCreator.create(this.game_card.top_card.name)
    this.card_gainer = new CardGainer(this.game, this.player_cards, 'discard', this.card.name(), true)
    this.all_player_cards = PlayerCardsModel.find(game._id)
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
      GameModel.update(this.game._id, this.game)
      PlayerCardsModel.update(this.game._id, this.player_cards)
    }
  }

  can_buy() {
    return this.is_purchasable() && this.is_valid_buy() && !this.is_contraband()
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
    this.buy_events()
    this.gain_card()
    this.embargo()
    this.goons()
  }

  update_turn() {
    this.game.turn.buys -= 1
    this.game.turn.coins -= CostCalculator.calculate(this.game, this.game_card.top_card, this.all_player_cards, true)
    this.game.turn.potions -= this.game_card.top_card.potion_cost
  }

  track_bought_card(card) {
    let bought_card = _.clone(this.game_card.top_card)
    this.game.turn.bought_cards.push(bought_card)
  }

  buy_events() {
    let buy_event_processor = new BuyEventProcessor(this)
    buy_event_processor.process()
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

  goons() {
    let goon_count = _.size(_.filter(this.player_cards.in_play, function(card) {
      return card.name === 'Goons'
    }))
    if (goon_count > 0) {
      this.player_cards.victory_tokens += goon_count
      this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> gets +${goon_count} &nabla; from ${CardView.card_html('action', 'Goons')}`)
    }
  }

  is_purchasable() {
    return this.card.is_purchasable() && (this.card.name() !== 'Grand Market' || this.allow_grand_market())
  }

  allow_grand_market() {
    let coppers = _.filter(this.player_cards.in_play, function(card) {
      return card.name === 'Copper'
    })
    return _.isEmpty(coppers)
  }

  is_valid_buy() {
    return this.has_remaining_stock() && this.has_enough_buys() && this.has_enough_money()
  }

  is_contraband() {
    return _.contains(this.game.turn.contraband, this.card.name())
  }

  has_remaining_stock() {
    return this.game_card.count > 0
  }

  has_enough_buys() {
    return this.game.turn.buys > 0
  }

  has_enough_money() {
    let coin_cost = CostCalculator.calculate(this.game, this.game_card.top_card, this.all_player_cards, true)
    return this.game.turn.coins >= coin_cost && this.game.turn.potions >= this.game_card.top_card.potion_cost
  }

  update_log() {
    let log_message = `<strong>${this.player_cards.username}</strong> buys ${CardView.render(this.card)}`
    if (this.game.turn.possessed) {
      log_message += ` but <strong>${this.game.turn.possessed.username}</strong> gains it`
    }
    if (this.card_gainer.destination === 'hand') {
      log_message += ', placing it in hand'
    } else if (this.card_gainer.destination === 'deck') {
      log_message += ', placing it on top of their deck'
    }
    this.game.log.push(log_message)
  }

}
