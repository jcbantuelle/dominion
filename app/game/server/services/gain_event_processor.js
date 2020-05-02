GainEventProcessor = class GainEventProcessor {

  static reaction_cards() {
    return [
      'Black Cat',
      'Falconer',
      'Fools Gold',
      'Sheepdog',
      'Sleigh',
      'Watchtower'
    ]
  }

  static event_cards() {
    return [
      'Blessed Village',
      'Border Village',
      'Cache',
      'Camel Train',
      'Cavalry',
      'Cemetery',
      'Cursed Village',
      'Crumbling Castle',
      'Death Cart',
      'Ducat',
      'Duchy',
      'Embassy',
      'Emporium',
      'Experiment',
      'Flag Bearer',
      'Fortune',
      'Grand Castle',
      'Haunted Castle',
      'Hostelry',
      'Ill Gotten Gains',
      'Inn',
      'Lackeys',
      'Lost City',
      'Mandarin',
      'Rocks',
      'Silk Merchant',
      'Skulk',
      'Spices',
      'Sprawling Castle',
      'Temple',
      'Villa'
    ]
  }

  static in_play_event_cards() {
    return [
      'Groundskeeper',
      'Royal Seal',
      'Tracker'
    ]
  }

  static reserve_cards() {
    return ['Duplicate']
  }

  static supply_cards() {
    return ['Changeling']
  }

  static landmark_cards() {
    return [
      'Aqueduct',
      'Battlefield',
      'Defiled Shrine',
      'Labyrinth'
    ]
  }

  static project_cards() {
    return [
      'Academy',
      'Guildhall',
      'Innovation',
      'Road Network'
    ]
  }

  static duration_attack_cards() {
    return ['Gatekeeper']
  }

  constructor(gainer, player_cards) {
    this.gainer = gainer
    this.player_cards = player_cards
    this.event_id = 1000
    this.find_gain_events()
  }

  find_gain_events() {
    this.gain_events = []

    if (this.gainer.player_cards._id === this.player_cards._id && _.includes(GainEventProcessor.event_cards(), this.gainer.gained_card.name)) {
      if (this.gainer.gained_card.name === 'Duchy') {
        if (this.gainer.game.duchess) {
          this.gain_events.push(this.gainer.gained_card)
        }
      } else if (this.gainer.gained_card.name === 'Emporium') {
        let action_count = _.size(_.filter(this.gainer.player_cards.in_play, function(card) {
          return _.includes(_.words(card.types), 'action')
        }))
        if (action_count >= 5) {
          this.gain_events.push(this.gainer.gained_card)
        }
      } else if (this.gainer.gained_card.name === 'Haunted Castle') {
        if (this.gainer.game.turn.player._id === this.gainer.player_cards.player_id) {
          this.gain_events.push(this.gainer.gained_card)
        }
      } else if (this.gainer.gained_card.name === 'Experiment') {
        if (!this.gainer.gained_by || this.gainer.gained_by.name !== 'Experiment') {
          this.gain_events.push(this.gainer.gained_card)
        }
      } else {
        this.gain_events.push(this.gainer.gained_card)
      }
    }

    _.each(this.player_cards.hand, (card) => {
      if (_.includes(GainEventProcessor.reaction_cards(), card.name)) {
        if (card.name === 'Fools Gold') {
          if (this.player_cards._id !== this.gainer.player_cards._id && this.gainer.gained_card.name === 'Province') {
            this.gain_events.push(card)
          }
        } else if (card.name === 'Watchtower') {
          if (this.player_cards._id === this.gainer.player_cards._id && !_.isEmpty(this.player_cards[this.gainer.destination]) && _.head(this.player_cards[this.gainer.destination]).id === this.gainer.gained_card.id) {
            this.gain_events.push(card)
          }
        } else if (card.name === 'Black Cat') {
          if (this.player_cards._id !== this.gainer.player_cards._id && _.includes(_.words(this.gainer.gained_card.types), 'victory')) {
            this.gain_events.push(card)
          }
        } else if (card.name === 'Sleigh') {
          if (this.player_cards._id === this.gainer.player_cards._id && !_.isEmpty(this.player_cards[this.gainer.destination]) && _.head(this.player_cards[this.gainer.destination]).id === this.gainer.gained_card.id) {
            this.gain_events.push(card)
          }
        } else if (card.name === 'Sheepdog') {
          if (this.player_cards._id === this.gainer.player_cards._id) {
            this.gain_events.push(card)
          }
        } else if (card.name === 'Falconer') {
          if (_.size(_.words(this.gainer.gained_card.types)) > 1) {
            this.gain_events.push(card)
          }
        }
      }
    })

    _.each(this.gainer.game.cards, (card) => {
      if (card.supply && card.count > 0 && _.includes(GainEventProcessor.supply_cards(), card.name)) {
        if (card.name === 'Changeling' && this.player_cards._id === this.gainer.player_cards._id) {
          if (this.gainer.gained_card.stack_name && CardCostComparer.coin_greater_than(this.gainer.game, this.gainer.gained_card, 2)) {
            this.gain_events.push(card.top_card)
          }
        }
      }
    })

    _.each(this.player_cards.in_play, (card) => {
      if (_.includes(GainEventProcessor.in_play_event_cards(), card.name)) {
        if (_.includes(['Royal Seal', 'Tracker'], card.name)) {
          if (this.player_cards._id === this.gainer.player_cards._id && !_.isEmpty(this.player_cards[this.gainer.destination]) && _.head(this.player_cards[this.gainer.destination]).id === this.gainer.gained_card.id) {
            this.gain_events.push(card)
          }
        } else if (card.name === 'Groundskeeper') {
          if (this.gainer.player_cards._id === this.player_cards._id && _.includes(_.words(this.gainer.gained_card.types), 'victory')) {
            this.gain_events.push(card)
          }
        } else {
          this.gain_events.push(card)
        }
      }
    })

    _.each(this.player_cards.tavern, (card) => {
      if (_.includes(GainEventProcessor.reserve_cards(), card.name)) {
        if (card.name === 'Duplicate') {
          if (this.player_cards._id === this.gainer.player_cards._id) {
            if (CardCostComparer.coin_less_than(this.gainer.game, this.gainer.gained_card, 7)) {
              this.gain_events.push(card)
            }
          }
        } else {
          this.gain_events.push(card)
        }
      }
    })

    _.each(this.gainer.game.landmarks, (card) => {
      if (this.gainer.player_cards._id === this.player_cards._id && _.includes(GainEventProcessor.landmark_cards(), card.name)) {
        if (card.name === 'Aqueduct') {
          if (_.includes(_.words(this.gainer.gained_card.types), 'treasure')) {
            let card_stack = _.find(this.gainer.game.cards, (card) => {
              return card.stack_name === this.gainer.gained_card.stack_name
            })
            if (card_stack && card_stack.victory_tokens > 0) {
              this.gain_events.push(card)
            }
          } else if (_.includes(_.words(this.gainer.gained_card.types), 'victory')) {
            if (card.victory_tokens > 0) {
              this.gain_events.push(card)
            }
          }
        } else if (card.name === 'Battlefield') {
          if (_.includes(_.words(this.gainer.gained_card.types), 'victory') && card.victory_tokens > 0) {
            this.gain_events.push(card)
          }
        } else if (card.name === 'Labyrinth') {
          if (_.size(this.gainer.game.turn.gained_cards) === 2 && card.victory_tokens > 0) {
            this.gain_events.push(card)
          }
        } else if (card.name === 'Defiled Shrine') {
          if (_.includes(_.words(this.gainer.gained_card.types), 'action')) {
            let card_stack = _.find(this.gainer.game.cards, (card) => {
              return card.stack_name === this.gainer.gained_card.stack_name
            })
            if (card_stack && card_stack.victory_tokens > 0) {
              this.gain_events.push(card)
            }
          }
        }
      }
    })

    _.each(this.gainer.player_cards.projects, (card) => {
      if (this.gainer.player_cards._id === this.player_cards._id && _.includes(GainEventProcessor.project_cards(), card.name)) {
        if (card.name === 'Academy') {
          if (_.includes(_.words(this.gainer.gained_card.types), 'action')) {
            this.gain_events.push(card)
          }
        } else if (card.name === 'Guildhall') {
          if (_.includes(_.words(this.gainer.gained_card.types), 'treasure')) {
            this.gain_events.push(card)
          }
        } else if (card.name === 'Innovation') {
          let gained_actions = _.filter(this.gainer.game.turn.gained_cards, (card) => {
            return _.includes(_.words(card.types), 'action')
          })
          if (!this.gainer.game.turn.innovation && _.size(gained_actions) === 1 && gained_actions[0].id === this.gainer.gained_card.id) {
            this.gainer.game.turn.innovation = true
            this.gain_events.push(card)
          }
        }
      }
    })

    _.each(this.player_cards.projects, (card) => {
      if (this.gainer.player_cards._id !== this.player_cards._id && _.includes(GainEventProcessor.project_cards(), card.name)) {
        if (card.name === 'Road Network') {
          if (_.includes(_.words(this.gainer.gained_card.types), 'victory')) {
            this.gain_events.push(card)
          }
        }
      }
    })

    _.each(this.player_cards.duration_attacks, (card) => {
      if (_.includes(GainEventProcessor.duration_attack_cards(), card.name)) {
        if (card.name === 'Gatekeeper' && this.gainer.player_cards._id === this.player_cards._id) {
          if (_.includes(_.words(this.gainer.gained_card.types), 'treasure') || _.includes(_.words(this.gainer.gained_card.types), 'action')) {
            let exiled_copy = _.find(this.player_cards.exile, (exile_card) => {
              return this.gainer.gained_card.name === exile_card.name
            })
            if (!exiled_copy) {
              this.gain_events.push(card)
            }
          }
        }
      }
    })

    if (this.gainer.player_cards._id === this.player_cards._id && _.includes(_.words(this.gainer.gained_card.types), 'victory') && this.gainer.supply_pile && this.gainer.supply_pile.has_trade_route_token) {
      let trade_route = ClassCreator.create('Trade Route').to_h()
      trade_route.id = this.generate_event_id()
      this.gain_events.push(trade_route)
    }

    if (this.gainer.player_cards._id !== this.player_cards._id && !_.isEmpty(this.player_cards.investments)) {
      let investments = _.find(this.player_cards.investments, (investment) => {
        return investment.name === this.gainer.gained_card.name
      })
      if (investments) {
        let invest = ClassCreator.create('Invest').to_h()
        invest.id = this.generate_event_id()
        this.gain_events.push(invest)
      }
    }

    if (this.gainer.player_cards._id === this.player_cards._id && this.gainer.game.turn.player._id === this.gainer.player_cards.player_id && this.gainer.game.turn.travelling_fair && this.gainer.destination !== 'deck') {
      let travelling_fair = ClassCreator.create('Travelling Fair').to_h()
      travelling_fair.id = this.generate_event_id()
      this.gain_events.push(travelling_fair)
    }

    if (this.gainer.player_cards._id === this.player_cards._id && this.gainer.game.turn.player._id === this.gainer.player_cards.player_id && !_.isEmpty(this.gainer.game.turn.cargo_ships)) {
      _.each(this.gainer.game.turn.cargo_ships, (cargo_ship) => {
        this.gain_events.push(cargo_ship)
      })
    }

    if (this.gainer.player_cards._id === this.player_cards._id && this.gainer.game.turn.player._id === this.gainer.player_cards.player_id && this.gainer.game.turn.liveries > 0 && CardCostComparer.coin_greater_than(this.gainer.game, this.gainer.gained_card, 3)) {
      _.times(this.gainer.game.turn.liveries, () => {
        let livery = ClassCreator.create('Livery').to_h()
        livery.id = this.generate_event_id()
        this.gain_events.push(livery)
      })
    }

    if (this.gainer.player_cards._id === this.player_cards._id && !_.isEmpty(this.player_cards.exile)) {
      let has_exile_cards = _.find(this.player_cards.exile, (card) => {
        return card.name === this.gainer.gained_card.name
      })
      if (has_exile_cards) {
        this.gain_events.push({
          name: 'Exile',
          id: this.generate_event_id(),
          wide: true,
          types: 'exile',
          image: 'exile'
        })
      }
    }
  }

  process() {
    if (!_.isEmpty(this.gain_events)) {
      let mandatory_gain_events = _.filter(this.gain_events, (event) => {
        return _.includes(GainEventProcessor.event_cards().concat(GainEventProcessor.in_play_event_cards()).concat(GainEventProcessor.reserve_cards()).concat(GainEventProcessor.landmark_cards()).concat(GainEventProcessor.duration_attack_cards()).concat(['Trade Route', 'Cargo Ship', 'Academy', 'Guildhall', 'Road Network', 'Innovation', 'Livery', 'Invest']), event.name)
      })
      if (_.size(this.gain_events) === 1 && !_.isEmpty(mandatory_gain_events)) {
        GainEventProcessor.gain_event(this.gainer.game, this.player_cards, this.gain_events, this)
      } else {
        GameModel.update(this.gainer.game._id, this.gainer.game)
        let instructions = `Choose Gain Event To Resolve for ${CardView.render(this.gainer.gained_card)}`
        let minimum = 1
        if (_.isEmpty(mandatory_gain_events)) {
          instructions += ' (or none to skip)'
          minimum = 0
        }
        let turn_event_id = TurnEventModel.insert({
          game_id: this.gainer.game._id,
          player_id: this.player_cards.player_id,
          username: this.player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: `${instructions}:`,
          cards: this.gain_events,
          minimum: minimum,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(this.gainer.game, this.player_cards, turn_event_id, this)
        turn_event_processor.process(GainEventProcessor.gain_event)
      }
    }
  }

  generate_event_id() {
    let event_id = _.toString(this.event_id)
    this.event_id += 1
    return event_id
  }

  static gain_event(game, player_cards, selected_cards, gain_event_processor) {
    if (!_.isEmpty(selected_cards)) {
      let card = selected_cards[0]
      if (card.name === 'Exile') {
        let exiled_copies = _.filter(player_cards.exile, (card) => {
          return card.name === gain_event_processor.gainer.gained_card.name
        })
        let card_discarder = new CardDiscarder(game, player_cards, 'exile', exiled_copies)
        card_discarder.discard()
      } else {
        let card_object = ClassCreator.create(card.name)
        if (_.includes(GainEventProcessor.reaction_cards(), card.name)) {
          card_object.gain_reaction(game, player_cards, gain_event_processor.gainer, card)
        } else {
          card_object.gain_event(gain_event_processor.gainer, card, player_cards)
        }
      }
      let event_index = _.findIndex(gain_event_processor.gain_events, (event) => {
        return event.id === card.id
      })
      gain_event_processor.gain_events.splice(event_index, 1)

      if (_.isEmpty(player_cards[gain_event_processor.gainer.destination]) || _.head(player_cards[gain_event_processor.gainer.destination]).id !== gain_event_processor.gainer.gained_card.id) {
        gain_event_processor.gain_events = _.filter(gain_event_processor.gain_events, (event) => {
          return event.name !== 'Watchtower' && event.name !== 'Royal Seal' && event.name !== 'Sleigh'
        })
      }
      if (gain_event_processor.gainer.destination === 'exile') {
        gain_event_processor.gain_events = _.filter(gain_event_processor.gain_events, (event) => {
          return event.name !== 'Gatekeeper'
        })
      }

      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      gain_event_processor.process()
    }
  }

}
