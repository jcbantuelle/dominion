BuyEventProcessor = class BuyEventProcessor {

  static reaction_cards() {
    return ['Hovel']
  }

  static event_cards() {
    return ['Noble Brigand', 'Farmland', 'Mint', 'Messenger', 'Port']
  }

  static in_play_event_cards() {
    return ['Haggler', 'Talisman', 'Hoard']
  }

  static overpay_cards() {
    return ['Stonemason', 'Doctor', 'Masterpiece', 'Herald']
  }

  static duration_attack_cards() {
    return ['Haunted Woods']
  }

  constructor(buyer) {
    this.buyer = buyer
    this.find_buy_events()
  }

  find_buy_events() {
    this.buy_events = []
    if (_.contains(BuyEventProcessor.event_cards(), this.buyer.card.name())) {
      if (this.buyer.card.name() === 'Messenger') {
        if (_.size(this.buyer.game.turn.bought_cards) === 1) {
          this.buy_events.push(this.buyer.card.to_h())
        }
      } else {
        this.buy_events.push(this.buyer.card.to_h())
      }
    }

    if (_.contains(BuyEventProcessor.overpay_cards(), this.buyer.card.name()) && this.buyer.game.turn.coins > 0) {
      this.buy_events.push(this.buyer.card.to_h())
    }

    _.each(this.buyer.player_cards.hand, (card) => {
      if (_.contains(BuyEventProcessor.reaction_cards(), card.name)) {
        if (card.name === 'Hovel') {
          if (_.contains(this.buyer.card.types(), 'victory')) {
            this.buy_events.push(card)
          }
        }
      }
    })

    _.each(this.buyer.player_cards.in_play, (card) => {
      if (_.contains(BuyEventProcessor.in_play_event_cards(), card.name)) {
        if (card.name === 'Talisman') {
          let cost = CostCalculator.calculate(this.buyer.game, this.buyer.card)
          if (cost <= 4 && this.buyer.card.potion_cost() === 0 && !_.contains(this.buyer.card.types(), 'victory')) {
            this.buy_events.push(card)
          }
        } else if (card.name === 'Hoard') {
          if (_.contains(this.buyer.card.types(), 'victory')) {
            this.buy_events.push(card)
          }
        } else {
          this.buy_events.push(card)
        }
      }
    })

    _.each(this.buyer.player_cards.duration_attacks, (card) => {
      if (_.contains(BuyEventProcessor.duration_attack_cards(), card.name)) {
        this.buy_events.push(card)
      }
    })
  }

  process() {
    if (!_.isEmpty(this.buy_events)) {
      let mandatory_buy_events = _.filter(this.buy_events, function(event) {
        return _.contains(BuyEventProcessor.event_cards().concat(BuyEventProcessor.in_play_event_cards()).concat(BuyEventProcessor.overpay_cards()).concat(BuyEventProcessor.duration_attack_cards()), event.name)
      })
      if (_.size(this.buy_events) === 1 && !_.isEmpty(mandatory_buy_events)) {
        BuyEventProcessor.buy_event(this.buyer.game, this.buyer.player_cards, this.buy_events, this)
      } else {
        GameModel.update(this.buyer.game._id, this.buyer.game)
        let instructions = `Choose Buy Event To Resolve for ${CardView.render(this.buyer.card)}`
        let minimum = 1
        if (_.isEmpty(mandatory_buy_events)) {
          instructions += ' (Or none to skip)'
          minimum = 0
        }
        let turn_event_id = TurnEventModel.insert({
          game_id: this.buyer.game._id,
          player_id: this.buyer.player_cards.player_id,
          username: this.buyer.player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: `${instructions}:`,
          cards: this.buy_events,
          minimum: minimum,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(this.buyer.game, this.buyer.player_cards, turn_event_id, this)
        turn_event_processor.process(BuyEventProcessor.buy_event)
      }
    }
  }

  static buy_event(game, player_cards, selected_cards, buy_event_processor) {
    if (!_.isEmpty(selected_cards)) {
      let selected_card = ClassCreator.create(selected_cards[0].name)
      if (_.contains(BuyEventProcessor.reaction_cards(), selected_card.name())) {
        selected_card.buy_reaction(game, player_cards, buy_event_processor.buyer)
        if (selected_cards[0].name === 'Hovel') {
          let buy_event_index = _.findIndex(buy_event_processor.buy_events, function(event) {
            return event.name === 'Hovel'
          })
          buy_event_processor.buy_events.splice(buy_event_index, 1)
        }
      } else {
        selected_card.buy_event(buy_event_processor.buyer)
        let buy_event_index = _.findIndex(buy_event_processor.buy_events, function(event) {
          return event.name === selected_cards[0].name
        })
        buy_event_processor.buy_events.splice(buy_event_index, 1)
      }

      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      buy_event_processor.process()
    }
  }

}
