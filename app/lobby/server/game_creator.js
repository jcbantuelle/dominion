GameCreator = class GameCreator {

  constructor(players, cards) {
    this.players = players
    let events = _.filter(cards, function(card) {
      return _.contains(CardList.events(), _.titleize(card.name))
    })

    this.events = this.event_cards(events)
    this.cards = _.reject(cards, function(card) {
      return _.contains(CardList.events(), _.titleize(card.name))
    })
    this.colors = ['red', 'blue', 'yellow', 'green']
  }

  create() {
    let game_id = this.create_game()
    this.game = GameModel.findOne(game_id)
    this.create_turn()
    this.start_game_log()
    this.set_up_players()
    this.assign_game_to_players()
    GameModel.update(this.game._id, this.game)
  }

  create_game() {
    let cards = this.game_cards()
    let game_attributes = {
      players: _.shuffle(this.players),
      cards: cards,
      events: this.events,
      duchess: this.game_has_card(cards, 'Duchess'),
      prizes: this.prizes(cards)
    }
    if (this.black_market_deck) {
      game_attributes.black_market_deck = this.black_market_deck
    }
    return GameModel.insert(game_attributes)
  }

  start_game_log() {
    let turn_order =  _.map(this.game.players, (player, index) => {
      let color = this.assign_colors ? this.colors[index] : ''
      return `<span class="${color}">${player.username}</span>`
    })

    this.game.log = [
      `Turn Order is: ${turn_order.join(', ')}`,
      `<strong>- ${this.game.turn.player.username}'s turn 1 -</strong>`
    ]
  }

  create_turn() {
    this.game.turn = {
      player: _.first(this.game.players),
      actions: 1,
      buys: 1,
      coins: 0,
      potions: 0,
      phase: 'action',
      bought_cards: [],
      gained_cards: [],
      gain_event_stack: [],
      contraband: [],
      forbidden_events: [],
      schemes: 0,
      possessions: 0,
      coin_discount: 0,
      played_actions: 0,
      coppersmiths: 0,
      expeditions: 0
    }
  }

  set_up_players() {
    PlayerCards[this.game._id] = new ReactiveDict()
    _.each(this.game.players, (player, index) => {
      this.create_player_cards(player, index)
    })
  }

  create_player_cards(player, index) {
    let copper = new Copper()
    coppers = _.times(7, function() { return copper.to_h() })

    var victory_cards
    if (this.use_dark_ages_cards) {
      let shelters = [
        new Hovel(),
        new Necropolis(),
        new OvergrownEstate()
      ]
      victory_cards = _.map(shelters, function(shelter) { return shelter.to_h() })
    } else {
      let estate = new Estate()
      victory_cards = _.times(3, function() { return estate.to_h() })
    }

    deck = _.shuffle(coppers.concat(victory_cards))
    hand = _.take(deck, 5)
    deck = _.drop(deck, 5)

    let coin_tokens = this.game_has_card(this.selected_kingdom_cards, 'Baker') ? 1 : 0

    let player_card_data = {
      player_id: player._id,
      game_id: this.game._id,
      username: player.username,
      deck: deck,
      hand: hand,
      coin_tokens: coin_tokens,
      tokens: {pile: []},
      turns: (this.game.turn.player._id === player._id) ? 1 : 0
    }

    if (this.assign_colors) {
      player_card_data.color = this.colors[index]
    }

    if (this.use_journey_token) {
      player_card_data.tokens.journey = 'up'
    }

    PlayerCardsModel.insert(player_card_data)
  }

  assign_game_to_players() {
    _.each(this.players, (player) => {
      Meteor.users.update(player._id, {
        $set: {current_game: this.game._id}
      })
    })
  }

  event_cards(events) {
    return _.sortBy(events, function(event) {
      return -event.coin_cost
    })
  }

  game_cards() {
    this.selected_kingdom_cards = this.kingdom_cards()
    this.use_prosperity_cards = this.prosperity_game()
    this.use_dark_ages_cards = this.dark_ages_game()
    this.use_potions = this.potion_game()
    this.use_journey_token = this.journey_game()
    this.selected_common_cards = this.common_cards()
    this.selected_not_supply_cards = this.not_supply_cards()
    if (this.game_has_card(this.selected_kingdom_cards, 'Trade Route')) {
      this.trade_route_game()
    }
    this.assign_colors = this.color_game()
    return this.selected_kingdom_cards.concat(this.selected_common_cards).concat(this.selected_not_supply_cards)
  }

  kingdom_cards() {
    let kingdom_cards = _.map(this.cards, (card) => {
      return this.game_card(card, 'kingdom')
    })

    if (this.game_has_card(kingdom_cards, 'Black Market')) {
      this.build_black_market_deck(kingdom_cards)
    }

    if (this.game_has_card(kingdom_cards, 'Young Witch')) {
      kingdom_cards.push(this.bane_card(kingdom_cards))
    }

    return _.sortBy(kingdom_cards, function(card) {
      if (card.name === 'Knights') {
        return -4.5
      } else {
        return -(card.top_card.coin_cost + (card.top_card.potion_cost * .1))
      }
    })
  }

  not_supply_cards() {
    let not_supply_cards = []
    if (this.game_has_card(this.selected_kingdom_cards, 'Hermit')) {
      not_supply_cards.push(this.game_card((new Madman()).to_h(), 'not_supply'))
    }
    if (this.game_has_card(this.selected_kingdom_cards, 'Urchin')) {
      not_supply_cards.push(this.game_card((new Mercenary()).to_h(), 'not_supply'))
    }
    if (this.game_has_card(this.selected_kingdom_cards, 'Page')) {
      _.each(['Treasure Hunter', 'Warrior', 'Hero', 'Champion'], (card_name) => {
        let card = ClassCreator.create(card_name)
        not_supply_cards.push(this.game_card(card.to_h(), 'not_supply'))
      })
    }
    if (this.game_has_card(this.selected_kingdom_cards, 'Peasant')) {
      _.each(['Soldier', 'Fugitive', 'Disciple', 'Teacher'], (card_name) => {
        let card = ClassCreator.create(card_name)
        not_supply_cards.push(this.game_card(card.to_h(), 'not_supply'))
      })
    }
    if (this.has_spoils(this.selected_kingdom_cards)) {
      not_supply_cards.push(this.game_card((new Spoils()).to_h(), 'not_supply'))
    }
    return _.sortBy(not_supply_cards, function(card) {
      return -(card.top_card.coin_cost + (card.top_card.potion_cost * .1))
    })
  }

  common_cards() {
    let cards = _.map(this.common_card_names(), function(card_name) {
      return ClassCreator.create(card_name).to_h()
    })

    return _.map(cards, (card) => {
      return this.game_card(card, 'common')
    })
  }

  common_card_names(kingdom_cards) {
    return this.victory_card_names().concat(this.treasure_card_names()).concat(this.miscellaneous_card_names())
  }

  victory_card_names() {
    let victory_cards = ['Province','Duchy','Estate']
    if (this.use_prosperity_cards) {
      victory_cards.unshift('Colony')
    }
    return victory_cards
  }

  treasure_card_names() {
    let treasure_cards = ['Gold','Silver','Copper']
    if (this.use_potions) {
      treasure_cards.splice(1, 0, 'Potion')
    }
    if (this.use_prosperity_cards) {
      treasure_cards.unshift('Platinum')
    }
    return treasure_cards
  }

  miscellaneous_card_names() {
    let miscellaneous_cards = ['Curse']
    if (this.has_looters()) {
      miscellaneous_cards.push('Ruins')
    }
    return miscellaneous_cards
  }

  game_card(card, source) {
    let card_stack = this.create_card_stack(card)
    return {
      name: card.name,
      count: _.size(card_stack),
      embargos: 0,
      top_card: _.first(card_stack),
      stack: card_stack,
      source: source,
      bane: card.bane,
      tokens: []
    }
  }

  create_card_stack(card) {
    if (card.name === 'Ruins') {
      return this.ruins_stack(card)
    } else if (card.name === 'Knights') {
      return this.knights_stack(card)
    } else {
      return _.times(this.stack_size(card), function(counter) {
        return card
      })
    }
  }

  stack_size(card) {
    if (_.contains(_.words(card.types), 'victory')) {
      return _.size(this.players) < 3 ? 8 : 12
    } else if (_.contains(['Curse', 'Ruins'], card.name)) {
      return _.size(this.players) === 1 ? 10 : _.size(this.players) * 10 - 10
    } else if (card.name === 'Copper') {
      return 60
    } else if (card.name === 'Silver') {
      return 40
    } else if (card.name === 'Gold') {
      return 30
    } else if (card.name === 'Platinum') {
      return 12
    } else if (card.name === 'Potion') {
      return 16
    } else if (card.name === 'Spoils') {
      return 15
    } else if (card.name === 'Rats') {
      return 20
    } else if (card.name === 'Port') {
      return 12
    } else if (_.contains(['Treasure Hunter', 'Warrior', 'Hero', 'Champion', 'Soldier', 'Fugitive', 'Disciple', 'Teacher'], card.name)) {
      return 5
    } else {
      return 10
    }
  }

  ruins_stack(card) {
    let ruins_cards = [
      new AbandonedMine(),
      new RuinedLibrary(),
      new RuinedMarket(),
      new RuinedVillage(),
      new Survivors()
    ]

    let ruins_pile = _.shuffle(_.flatten(_.map(ruins_cards, function(ruin) {
      return _.times(10, function() { return ruin.to_h() })
    })))

    return _.take(ruins_pile, this.stack_size(card))
  }

  knights_stack(card) {
    let knights_cards = [
      new SirMartin(),
      new DameAnna(),
      new DameJosephine(),
      new DameMolly(),
      new DameNatalie(),
      new DameSylvia(),
      new SirBailey(),
      new SirDestry(),
      new SirMichael(),
      new SirVander()
    ]

    return _.shuffle(_.map(knights_cards, function(knight) {
      return knight.to_h()
    }))
  }

  prizes(cards) {
    let tournament = _.find(cards, function(card) {
      return card.name === 'Tournament'
    })

    if (tournament) {
      let prizes = [
        new BagOfGold(),
        new Diadem(),
        new Followers(),
        new Princess(),
        new TrustySteed()
      ]
      return _.map(prizes, function(prize) {
        return prize.to_h()
      })
    }
  }

  game_has_card(cards, card_name) {
    if (this.black_market_deck && card_name !== 'Duchess') {
      cards = cards.concat(this.black_market_deck)
    }
    return _.any(cards, function(card) {
      return card.name === card_name
    })
  }

  has_looters() {
    let black_market_looters = false
    if (this.black_market_deck) {
      black_market_looters = _.any(this.black_market_deck, function(card) {
        return _.contains(_.words(card.types), 'looter')
      })
    }
    return black_market_looters || _.any(this.selected_kingdom_cards, function(card) {
      return _.contains(_.words(card.top_card.types), 'looter')
    })
  }

  has_spoils(cards) {
    if (this.black_market_deck) {
      cards = cards.concat(this.black_market_deck)
    }
    return _.any(cards, function(card) {
      return _.contains(['Marauder', 'Bandit Camp', 'Pillage'], card.name)
    })
  }

  build_black_market_deck(kingdom_cards) {
    let used_card_names = _.map(kingdom_cards, function(card) {
      return _.titleize(card.name)
    })
    let available_cards = _.shuffle(_.difference(CardList.full_list(), used_card_names))

    let black_market_card_names = _.take(available_cards, 25)
    let knight_index = _.findIndex(black_market_card_names, function(name) {
      name === 'Knights'
    })
    if (knight_index !== -1) {
      let knight_names = _.shuffle(['SirMartin', 'DameAnna', 'DameJosephine', 'DameMolly', 'DameNatalie', 'DameSylvia', 'SirBailey', 'SirDestry', 'SirMichael', 'SirVander'])
      black_market_card_names.splice(knight_index, 1, _.take(knight_names, 1))
    }
    this.black_market_deck = _.map(black_market_card_names, function(name) {
      return ClassCreator.create(name).to_h()
    })
  }

  bane_card(cards) {
    let game_card_names = _.pluck(cards, 'name')
    if (this.black_market_deck) {
      game_card_names = game_card_names.concat(_.pluck(this.black_market_deck, 'name'))
    }
    var card
    do {
      card = CardList.pull_one()
    } while (card.coin_cost < 2 || card.coin_cost > 3 || card.potion_cost !== 0 || _.contains(game_card_names, card.name))
    card.bane = true
    return this.game_card(card, 'kingdom')
  }

  prosperity_game() {
    let card_names = CardList.prosperity()
    let prosperity_count = _.size(_.filter(this.selected_kingdom_cards, function(card) {
      return _.contains(card_names, _.titleize(card.name))
    }))
    let random_number = this.random_number(1, _.size(this.selected_kingdom_cards))
    return prosperity_count >= random_number
  }

  dark_ages_game() {
    let card_names = CardList.dark_ages()
    let dark_ages_count = _.size(_.filter(this.selected_kingdom_cards, function(card) {
      return _.contains(card_names, _.titleize(card.name))
    }))
    let random_number = this.random_number(1, _.size(this.selected_kingdom_cards))
    return dark_ages_count >= random_number
  }

  potion_game() {
    return _.any(this.selected_kingdom_cards, function(card) {
      return card.top_card.potion_cost > 0
    })
  }

  journey_game() {
    return _.any(this.selected_kingdom_cards, function(card) {
      return _.contains(['Ranger', 'Giant'], card.name)
    })
  }

  color_game() {
    return _.any(this.selected_kingdom_cards, function(card) {
      return card.name === 'Peasant'
    })
  }

  trade_route_game() {
    this.selected_kingdom_cards = _.map(this.selected_kingdom_cards, this.set_trade_route_token)
    this.selected_common_cards = _.map(this.selected_common_cards, this.set_trade_route_token)
  }

  set_trade_route_token(card) {
    if (card.name != 'Knights' && _.contains(_.words(card.top_card.types), 'victory')) {
      card.has_trade_route_token = true
    }
    return card
  }

  random_number(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

}
