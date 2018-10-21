GameCreator = class GameCreator {

  constructor(players, cards, exclusions, edition) {
    this.players = players
    this.exclusions = exclusions
    this.edition = edition
    let events = _.filter(cards, function(card) {
      return _.includes(CardList.event_cards(), _.titleize(card.name))
    })
    this.events = this.event_cards(events)

    let landmarks = _.filter(cards, function(card) {
      return _.includes(CardList.landmark_cards(), _.titleize(card.name))
    })
    this.landmarks = this.landmark_cards(landmarks)

    this.cards = _.reject(cards, function(card) {
      return _.includes(CardList.event_cards().concat(CardList.landmark_cards()), _.titleize(card.name))
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
      landmarks: this.landmarks,
      duchess: this.game_has_card(cards, 'Duchess'),
      prizes: this.prizes(cards),
      trash: []
    }
    if (this.black_market_deck) {
      game_attributes.black_market_deck = this.black_market_deck
    }
    if (this.druid_boons) {
      game_attributes.druid_boons = this.druid_boons
    }
    if (this.artifacts) {
      game_attributes.artifacts = this.artifacts
    }
    if (this.boons_deck) {
      game_attributes.boons_deck = this.boons_deck
      game_attributes.boons_discard = []
    }
    if (this.hexes_deck) {
      game_attributes.hexes_deck = this.hexes_deck
      game_attributes.hexes_discard = []
    }
    if (this.obelisk) {
      game_attributes.obelisk = this.obelisk
    }
    if (this.game_has_card(cards, 'Necromancer')) {
      game_attributes.trash.push((new ZombieApprentice()).to_h())
      game_attributes.trash.push((new ZombieMason()).to_h())
      game_attributes.trash.push((new ZombieSpy()).to_h())
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
      player: _.head(this.game.players),
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
      river_gifts: [],
      expeditions: 0,
      charms: 0,
      priests: 0,
      horns: 0,
      experiments_gained: 0
    }
  }

  set_up_players() {
    PlayerCards[this.game._id] = new ReactiveDict()
    _.each(this.game.players, (player, index) => {
      this.create_player_cards(player, index)
    })
  }

  create_player_cards(player, index) {
    let starting_treasures = []
    if (this.game_has_card(this.selected_kingdom_cards, 'Pixie')) {
      starting_treasures.push(new Goat())
    }
    if (this.game_has_card(this.selected_kingdom_cards, 'Tracker')) {
      starting_treasures.push(new Pouch())
    }
    if (this.game_has_card(this.selected_kingdom_cards, 'Fool')) {
      starting_treasures.push(new LuckyCoin())
    }
    if (this.game_has_card(this.selected_kingdom_cards, 'Secret Cave')) {
      starting_treasures.push(new MagicLamp())
    }
    if (this.game_has_card(this.selected_kingdom_cards, 'Cemetery')) {
      starting_treasures.push(new HauntedMirror())
    }
    if (this.game_has_card(this.selected_kingdom_cards, 'Shepherd')) {
      starting_treasures.push(new Pasture())
    }
    if (this.game_has_card(this.selected_kingdom_cards, 'Pooka')) {
      starting_treasures.push(new CursedGold())
    }

    let copper = new Copper()
    let coppers = _.times(7-_.size(starting_treasures), function() { return copper })

    starting_treasures = _.map(starting_treasures.concat(coppers), function(treasure) { return treasure.to_h() })

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

    deck = _.shuffle(starting_treasures.concat(victory_cards))
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
      villagers: 0,
      debt_tokens: 0,
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

  landmark_cards(landmarks) {
    return _.map(landmarks, (landmark) => {
      if (_.includes(['Arena', 'Basilica', 'Baths', 'Battlefield', 'Colonnade', 'Labyrinth'], landmark.name)) {
        landmark.victory_tokens = 6 * _.size(this.players)
        return landmark
      } else {
        return landmark
      }
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

    if (this.game_has_card(kingdom_cards, 'Druid')) {
      this.select_druid_boons()
    }

    if (this.game_has_card(kingdom_cards, 'Border Guard')) {
      this.add_artifact(Horn)
      this.add_artifact(Lantern)
    }

    if (this.game_has_card(kingdom_cards, 'Flag Bearer')) {
      this.add_artifact(Flag)
    }

    if (this.game_has_card(kingdom_cards, 'Treasurer')) {
      this.add_artifact(Key)
    }

    if (this.game_has_card(kingdom_cards, 'Swashbuckler')) {
      this.add_artifact(TreasureChest)
    }

    if (this.has_boons(kingdom_cards)) {
      this.build_boons_deck()
    }

    if (this.has_hexes(kingdom_cards)) {
      this.hexes_deck = _.shuffle(this.hexes())
    }

    if (this.game_has_event_or_landmark(this.landmarks, 'Obelisk')) {
      let obelisk_card
      do {
        obelisk_card = _.sample(kingdom_cards)
      } while (!_.includes(_.words(obelisk_card.top_card.types), 'action'))
      this.obelisk = obelisk_card.stack_name
      obelisk_card.obelisk = true
    }

    return _.sortBy(kingdom_cards, function(card) {
      if (card.name === 'Knights') {
        return -4.5
      } else {
        return -(card.top_card.coin_cost + (card.top_card.potion_cost * .1) + (card.top_card.debt_cost * .001))
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
    if (this.game_has_card(this.selected_kingdom_cards, 'Cemetery') || this.game_has_card(this.selected_kingdom_cards, 'Exorcist')) {
      not_supply_cards.push(this.game_card((new Ghost()).to_h(), 'not_supply'))
    }
    if (this.game_has_card(this.selected_kingdom_cards, 'Leprechaun') || this.game_has_card(this.selected_kingdom_cards, 'Secret Cave')) {
      not_supply_cards.push(this.game_card((new Wish()).to_h(), 'not_supply'))
    }
    if (this.game_has_card(this.selected_kingdom_cards, 'Vampire')) {
      not_supply_cards.push(this.game_card((new Bat()).to_h(), 'not_supply'))
    }
    if (this.game_has_card(this.selected_kingdom_cards, 'Devils Workshop') || this.game_has_card(this.selected_kingdom_cards, 'Exorcist') || this.game_has_card(this.selected_kingdom_cards, 'Tormentor')) {
      not_supply_cards.push(this.game_card((new Imp()).to_h(), 'not_supply'))
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
    if (this.has_swamps_gift(this.selected_kingdom_cards) || this.game_has_card(this.selected_kingdom_cards, 'Exorcist')) {
      not_supply_cards.push(this.game_card((new WillOWisp()).to_h(), 'not_supply'))
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
    let debt_token = this.game_has_event_or_landmark(this.events, 'Tax') && _.head(card_stack).purchasable ? 1 : 0

    let victory_tokens = this.game_card_victory_tokens(card_stack, source)
    return {
      name: card.name,
      count: _.size(card_stack),
      embargos: 0,
      top_card: _.head(card_stack),
      stack: card_stack,
      stack_name: card.stack_name,
      source: source,
      bane: card.bane,
      victory_tokens: victory_tokens,
      debt_tokens: debt_token,
      tokens: []
    }
  }

  game_card_victory_tokens(card, source) {
    let victory_tokens = 0
    if (this.game_has_event_or_landmark(this.landmarks, 'Aqueduct') && _.includes(['Silver', 'Gold'], _.head(card).name)) {
      victory_tokens += 8
    }
    if (this.game_has_event_or_landmark(this.landmarks, 'Defiled Shrine') && _.includes(_.words(_.head(card).types), 'action') && !_.includes(_.words(_.head(card).types), 'gathering')) {
      victory_tokens += 2
    }
    return victory_tokens
  }

  create_card_stack(card) {
    if (card.name === 'Ruins') {
      return this.ruins_stack(card)
    } else if (card.name === 'Knights') {
      return this.knights_stack(card)
    } else if (card.name === 'Castles') {
      return this.castles_stack(card)
    } else if (_.includes(['Encampment', 'Patrician', 'Settlers', 'Catapult', 'Gladiator', 'Sauna'], card.name)) {
      return this.split_stack(card)
    } else {
      return _.times(this.stack_size(card), function(counter) {
        return card
      })
    }
  }

  stack_size(card) {
    if (_.includes(_.words(card.types), 'victory')) {
      return _.size(this.players) < 3 ? 8 : 12
    } else if (_.includes(['Curse', 'Ruins'], card.name)) {
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
    } else if (card.name === 'Will O Wisp') {
      return 12
    } else if (card.name === 'Wish') {
      return 12
    } else if (card.name === 'Imp') {
      return 13
    } else if (card.name === 'Ghost') {
      return 6
    } else if (_.includes(['Treasure Hunter', 'Warrior', 'Hero', 'Champion', 'Soldier', 'Fugitive', 'Disciple', 'Teacher'], card.name)) {
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

  castles_stack(card) {
    let castle_cards = [
      new HumbleCastle(),
      new CrumblingCastle(),
      new SmallCastle(),
      new HauntedCastle(),
      new OpulentCastle(),
      new SprawlingCastle(),
      new GrandCastle(),
      new KingsCastle()
    ]

    if (_.size(this.players) > 2) {
      castle_cards.splice(0, 0, new HumbleCastle())
      castle_cards.splice(3, 0, new SmallCastle())
      castle_cards.splice(6, 0, new OpulentCastle())
      castle_cards.splice(10, 0, new KingsCastle())
    }

    return _.map(castle_cards, function(castle) {
      castle = castle.to_h()
      castle.bane = card.bane
      return castle
    })
  }

  split_stack(card) {
    let top_card, bottom_card
    if (card.name === 'Encampment') {
      top_card = 'Encampment'
      bottom_card = 'Plunder'
    } else if (card.name === 'Patrician') {
      top_card = 'Patrician'
      bottom_card = 'Emporium'
    } else if (card.name === 'Settlers') {
      top_card = 'Settlers'
      bottom_card = 'Bustling Village'
    } else if (card.name === 'Catapult') {
      top_card = 'Catapult'
      bottom_card = 'Rocks'
    } else if (card.name === 'Gladiator') {
      top_card = 'Gladiator'
      bottom_card = 'Fortune'
    } else if (card.name === 'Sauna') {
      top_card = 'Sauna'
      bottom_card = 'Avanto'
    }

    top_card = ClassCreator.create(top_card).to_h()
    top_card.bane = card.bane
    let top_stack = _.times(5, function(counter) {
      return top_card
    })

    bottom_card = ClassCreator.create(bottom_card).to_h()
    bottom_card.bane = card.bane
    let bottom_stack = _.times(5, function(counter) {
      return bottom_card
    })

    return top_stack.concat(bottom_stack)
  }

  prizes(cards) {
    if (this.game_has_card(cards, 'Tournament')) {
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

  boons() {
    let boons = [
      new TheEarthsGift(),
      new TheFieldsGift(),
      new TheFlamesGift(),
      new TheForestsGift(),
      new TheMoonsGift(),
      new TheMountainsGift(),
      new TheRiversGift(),
      new TheSeasGift(),
      new TheSkysGift(),
      new TheSunsGift(),
      new TheSwampsGift(),
      new TheWindsGift()
    ]
    return _.map(boons, function(boon) {
      return boon.to_h()
    })
  }

  hexes() {
    let hexes = [
      new BadOmens(),
      new Delusion(),
      new Envy(),
      new Famine(),
      new Fear(),
      new Greed(),
      new Haunting(),
      new Locusts(),
      new Misery(),
      new Plague(),
      new Poverty(),
      new War()
    ]
    return _.map(hexes, function(hex) {
      return hex.to_h()
    })
  }

  game_has_card(cards, card_name) {
    if (this.black_market_deck && !_.includes(['Duchess', 'Page', 'Peasant'], card_name)) {
      cards = cards.concat(this.black_market_deck)
    }
    return _.some(cards, function(card) {
      return card.name === card_name
    })
  }

  game_has_event_or_landmark(cards, card_name) {
    return _.some(cards, function(card) {
      return card.name === card_name
    })
  }

  has_boons(cards) {
    if (this.black_market_deck) {
      cards = cards.concat(this.black_market_deck)
    }
    return _.some(cards, function(card) {
      return _.includes(_.words(card.top_card ? card.top_card.types : card.types), 'fate') && card.name != 'Druid'
    })
  }

  has_hexes(cards) {
    if (this.black_market_deck) {
      cards = cards.concat(this.black_market_deck)
    }
    return _.some(cards, function(card) {
      return _.includes(_.words(card.top_card ? card.top_card.types : card.types), 'doom')
    })
  }

  has_swamps_gift(cards) {
    return this.has_boons(cards) || _.some(this.druid_boons, function(card) {
      return card.name === 'The Swamps Gift'
    })
  }

  has_looters() {
    let black_market_looters = false
    if (this.black_market_deck) {
      black_market_looters = _.some(this.black_market_deck, function(card) {
        return _.includes(_.words(card.types), 'looter')
      })
    }
    return black_market_looters || _.some(this.selected_kingdom_cards, function(card) {
      return _.includes(_.words(card.top_card.types), 'looter')
    })
  }

  has_spoils(cards) {
    if (this.black_market_deck) {
      cards = cards.concat(this.black_market_deck)
    }
    return _.some(cards, function(card) {
      return _.includes(['Marauder', 'Bandit Camp', 'Pillage'], card.name)
    })
  }

  build_black_market_deck(kingdom_cards) {
    let used_card_names = _.map(kingdom_cards, function(card) {
      return _.titleize(card.name)
    })
    let available_cards = _.shuffle(_.difference(CardList.kingdom_cards(this.exclusions, this.edition), used_card_names))

    let black_market_card_names = _.take(available_cards, 25)
    let knight_index = _.findIndex(black_market_card_names, function(name) {
      return name === 'Knights'
    })
    if (knight_index !== -1) {
      let knight_names = _.shuffle(['SirMartin', 'DameAnna', 'DameJosephine', 'DameMolly', 'DameNatalie', 'DameSylvia', 'SirBailey', 'SirDestry', 'SirMichael', 'SirVander'])
      black_market_card_names.splice(knight_index, 1, _.take(knight_names, 1))
    }
    this.black_market_deck = _.map(black_market_card_names, function(name) {
      return ClassCreator.create(name).to_h()
    })
  }

  select_druid_boons() {
    this.druid_boons = _.take(_.shuffle(this.boons()), 3)
  }

  add_artifact(artifact) {
    this.artifacts = this.artifacts || []
    this.artifacts.push((new artifact()).to_h())
  }

  build_boons_deck() {
    this.boons_deck = _.shuffle(this.boons())
    if (this.druid_boons) {
      druid_boon_names = _.map(this.druid_boons, 'name')
      this.boons_deck = _.reject(this.boons_deck, (boon) => {
        return _.includes(druid_boon_names, boon.name)
      })
    }
  }

  bane_card(cards) {
    let game_card_names = _.map(cards, 'name')
    if (this.black_market_deck) {
      game_card_names = game_card_names.concat(_.map(this.black_market_deck, 'name'))
    }
    var card
    do {
      card = CardList.pull_one(this.exclusions, this.edition)
    } while (card.coin_cost < 2 || card.coin_cost > 3 || card.potion_cost !== 0 || _.includes(game_card_names, card.name))
    card.bane = true
    return this.game_card(card, 'kingdom')
  }

  prosperity_game() {
    let card_names = CardList.prosperity()
    let prosperity_count = _.size(_.filter(this.selected_kingdom_cards, function(card) {
      return _.includes(card_names, _.titleize(card.name))
    }))
    let random_number = this.random_number(1, _.size(this.selected_kingdom_cards))
    return prosperity_count >= random_number
  }

  dark_ages_game() {
    let card_names = CardList.dark_ages()
    let dark_ages_count = _.size(_.filter(this.selected_kingdom_cards, function(card) {
      return _.includes(card_names, _.titleize(card.name))
    }))
    let random_number = this.random_number(1, _.size(this.selected_kingdom_cards))
    return dark_ages_count >= random_number
  }

  potion_game() {
    let black_market_potion = false
    if (this.black_market_deck) {
      black_market_potion = _.some(this.black_market_deck, function(card) {
        return card.potion_cost > 0
      })
    }
    return black_market_potion || _.some(this.selected_kingdom_cards, function(card) {
      return card.top_card.potion_cost > 0
    })
  }

  journey_game() {
    let game_cards = this.selected_kingdom_cards.concat(this.events)
    if (this.black_market_deck) game_cards = game_cards.concat(this.black_market_deck)

    return _.some(game_cards, function(card) {
      return _.includes(['Ranger', 'Giant', 'Pilgrimage'], card.name)
    })
  }

  color_game() {
    let game_cards = this.selected_kingdom_cards.concat(this.events)
    if (this.black_market_deck) game_cards = game_cards.concat(this.black_market_deck)

    return _.some(game_cards, function(card) {
      return _.includes(['Peasant', 'Ferry', 'Plan', 'Seaway', 'Lost Arts', 'Training', 'Pathfinding'], card.name)
    })
  }

  trade_route_game() {
    this.selected_kingdom_cards = _.map(this.selected_kingdom_cards, this.set_trade_route_token)
    this.selected_common_cards = _.map(this.selected_common_cards, this.set_trade_route_token)
  }

  set_trade_route_token(card) {
    if (card.name != 'Knights' && _.includes(_.words(card.top_card.types), 'victory')) {
      card.has_trade_route_token = true
    }
    return card
  }

  random_number(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

}
