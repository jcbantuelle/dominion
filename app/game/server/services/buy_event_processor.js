BuyEventProcessor = class BuyEventProcessor {

  constructor(buyer) {
    this.buyer = buyer
    this.buy_event_cards = ['Noble Brigand', 'Farmland', 'Mint']
    this.in_play_buy_events = ['Haggler', 'Talisman']
    this.find_buy_events()
  }

  find_buy_events() {
    this.buy_events = []

    if (_.contains(this.buy_event_cards, this.buyer.card.name())) {
      this.buy_events.push(this.buyer.card.to_h())
    }

    _.each(this.buyer.player_cards.in_play, (card) => {
      if (_.contains(this.in_play_buy_events, card.name)) {
        if (card.name === 'Talisman') {
          let cost = CostCalculator.calculate(this.buyer.game, this.buyer.player_cards, this.buyer.card)
          if (cost <= 4 && this.buyer.card.potion_cost() === 0 && !_.contains(this.buyer.card.type_class(), 'victory')) {
            this.buy_events.push(card)
          }
        } else {
          this.buy_events.push(card)
        }
      }
    })
  }

  process() {
    if (!_.isEmpty(this.buy_events)) {
      if (_.size(this.buy_events) === 1) {
        BuyEventProcessor.buy_event(this.buyer.game, this.buyer.player_cards, this.buy_events, this)
      } else {
        Games.update(this.buyer.game._id, this.buyer.game)
        let turn_event_id = TurnEvents.insert({
          game_id: this.buyer.game._id,
          player_id: this.buyer.player_cards.player_id,
          username: this.buyer.player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose Buy Event To Resolve:',
          cards: this.buy_events,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(this.buyer.game, this.buyer.player_cards, turn_event_id, this)
        turn_event_processor.process(BuyEventProcessor.buy_event)
      }
    }
  }

  static buy_event(game, player_cards, selected_cards, buy_event_processor) {
    let selected_card = ClassCreator.create(selected_cards[0].name)
    selected_card.buy_event(buy_event_processor.buyer)
    Games.update(game._id, game)
    PlayerCards.update(player_cards._id, player_cards)
    let buy_event_index = _.findIndex(buy_event_processor.buy_events, function(event) {
      return event.name === selected_cards[0].name
    })
    buy_event_processor.buy_events.splice(buy_event_index, 1)
    buy_event_processor.process()
  }

}
