BuyEventProcessor = class BuyEventProcessor {

  static reaction_cards() {
    return ['Hovel']
  }

  static landmark_cards() {
    return ['Basilica', 'Colonnade', 'Defiled Shrine']
  }

  static event_cards() {
    return ['Noble Brigand', 'Farmland', 'Mint', 'Messenger', 'Port', 'Forum']
  }

  static in_play_event_cards() {
    return ['Haggler', 'Talisman', 'Hoard', 'Goons', 'Merchant Guild']
  }

  static overpay_cards() {
    return ['Stonemason', 'Doctor', 'Masterpiece', 'Herald']
  }

  static duration_attack_cards() {
    return ['Haunted Woods', 'Swamp Hag']
  }

  constructor(buyer) {
    this.buyer = buyer
    this.event_id = 2000
    this.find_buy_events()
  }

  find_buy_events() {
    this.buy_events = []
    if (_.includes(BuyEventProcessor.event_cards(), this.buyer.card.name)) {
      if (this.buyer.card.name === 'Messenger') {
        if (_.size(this.buyer.game.turn.bought_things) === 1) {
          this.buy_events.push(this.buyer.card)
        }
      } else {
        this.buy_events.push(this.buyer.card)
      }
    }

    _.each(this.buyer.game.landmarks, (card) => {
      if (_.includes(BuyEventProcessor.landmark_cards(), card.name)) {
        if (card.name === 'Basilica' && card.victory_tokens > 0 && this.buyer.game.turn.coins >= 2) {
            this.buy_events.push(card)
        } else if (card.name === 'Colonnade' && card.victory_tokens > 0 && _.includes(_.words(this.buyer.card.types), 'action') && _.some(this.buyer.player_cards.in_play, (card) => { return card.name === this.buyer.card.name})) {
            this.buy_events.push(card)
        } else if (card.name === 'Defiled Shrine' && card.victory_tokens > 0 && this.buyer.card.name === 'Curse') {
            this.buy_events.push(card)
        }
      }
    })

    if (_.includes(BuyEventProcessor.overpay_cards(), this.buyer.card.name) && this.buyer.game.turn.coins > 0) {
      this.buy_events.push(this.buyer.card)
    }

    _.each(this.buyer.player_cards.hand, (card) => {
      if (_.includes(BuyEventProcessor.reaction_cards(), card.name)) {
        if (card.name === 'Hovel') {
          if (_.includes(_.words(this.buyer.card.types), 'victory')) {
            this.buy_events.push(card)
          }
        }
      }
    })

    _.each(this.buyer.player_cards.in_play, (card) => {
      if (_.includes(BuyEventProcessor.in_play_event_cards(), card.name)) {
        if (card.name === 'Talisman') {
          if (!_.includes(_.words(this.buyer.card.types), 'victory') && CardCostComparer.coin_less_than(this.buyer.game, this.buyer.card, 5)) {
            this.buy_events.push(card)
          }
        } else if (card.name === 'Hoard') {
          if (_.includes(_.words(this.buyer.card.types), 'victory')) {
            this.buy_events.push(card)
          }
        } else {
          this.buy_events.push(card)
        }
      }
    })

    _.each(this.buyer.player_cards.duration_attacks, (card) => {
      if (_.includes(BuyEventProcessor.duration_attack_cards(), card.name)) {
        this.buy_events.push(card)
      }
    })

    if (this.buyer.game_card.embargos > 0) {
      let embargo = ClassCreator.create('Embargo').to_h()
      embargo.id = this.generate_event_id()
      this.buy_events.push(embargo)
    }

    _.times(this.buyer.game.turn.charms, () => {
      let charm = ClassCreator.create('Charm').to_h()
      charm.id = this.generate_event_id()
      this.buy_events.push(charm)
    })

    if (this.buyer.game_card.debt_tokens > 0) {
      let tax = ClassCreator.create('Tax').to_h()
      tax.id = this.generate_event_id()
      this.buy_events.push(tax)
    }

    let trashing_token = _.find(this.buyer.player_cards.tokens.pile, (token) => {
      return token.effect === 'trashing'
    })
    if (trashing_token && trashing_token.card.stack_name === this.buyer.card.stack_name) {
      this.buy_events.push({
        name: 'Trash Token',
        id: this.generate_event_id(),
        trashing_token: true,
        types: 'trashing_token',
        image: 'trashing_token'
      })
    }
  }

  process() {
    if (!_.isEmpty(this.buy_events)) {
      let mandatory_buy_events = _.filter(this.buy_events, (event) => {
        return _.includes(BuyEventProcessor.event_cards().concat(BuyEventProcessor.in_play_event_cards()).concat(BuyEventProcessor.overpay_cards()).concat(BuyEventProcessor.duration_attack_cards()).concat(BuyEventProcessor.landmark_cards()).concat(['Embargo', 'Charm', 'Tax']), event.name)
      })
      if (_.size(this.buy_events) === 1 && !_.isEmpty(mandatory_buy_events)) {
        BuyEventProcessor.buy_event(this.buyer.game, this.buyer.player_cards, this.buy_events, this)
      } else {
        GameModel.update(this.buyer.game._id, this.buyer.game)
        let instructions = `Choose Buy Event To Resolve for ${CardView.render(this.buyer.card)}`
        let minimum = 1
        if (_.isEmpty(mandatory_buy_events)) {
          instructions += ' (or none to skip)'
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
      let card = selected_cards[0]
      if (card.name === 'Trash Token') {
        if (_.size(player_cards.hand) > 0) {
          let turn_event_id = TurnEventModel.insert({
            game_id: game._id,
            player_id: player_cards.player_id,
            username: player_cards.username,
            type: 'choose_cards',
            player_cards: true,
            instructions: 'Choose a card to trash: (or none to skip)',
            cards: player_cards.hand,
            minimum: 0,
            maximum: 1
          })
          let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
          turn_event_processor.process(BuyEventProcessor.trash_card)
        } else {
          game.log.push(`&nbsp;&nbsp;but there are no cards in hand for the Trash Token`)
        }
      } else {
        let card_object = ClassCreator.create(card.name)
        if (_.includes(BuyEventProcessor.reaction_cards(), card.name)) {
          card_object.buy_reaction(game, player_cards, buy_event_processor.buyer, card)
        } else {
          card_object.buy_event(buy_event_processor.buyer, card)
        }
      }

      let buy_event_index = _.findIndex(buy_event_processor.buy_events, (event) => {
        return event.id === card.id
      })
      buy_event_processor.buy_events.splice(buy_event_index, 1)

      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      buy_event_processor.process()
    }
  }

  generate_event_id() {
    let event_id = _.toString(this.event_id)
    this.event_id += 1
    return event_id
  }

  static trash_card(game, player_cards, selected_cards) {
    let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
    card_trasher.trash()
  }

}
