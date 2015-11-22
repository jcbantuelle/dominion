GameCreator = class GameCreator {

  constructor(players, cards) {
    this.players = players
    this.cards = cards
  }

  create() {
    let game_id = this.create_game()
    this.game = Games.findOne(game_id)
    this.create_turn()
    this.start_game_log()
    this.set_up_players()
    this.assign_game_to_players()
    Games.update(this.game._id, this.game)
  }

  create_game() {
    let cards = this.game_cards()
    return Games.insert({
      players: _.shuffle(this.players),
      cards: cards,
      trash: [],
      trade_route_tokens: 0,
      log: [],
      turn_number: 1,
      duchess: this.has_duchess(cards)
    })
  }

  start_game_log() {
    let turn_order =  _.map(this.game.players, function(player) {
      return player.username
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
      last_player_bought_cards: [],
      last_player_gained_cards: [],
      gain_reaction_stack: [],
      schemes: 0
    }
  }

  set_up_players() {
    _.each(this.game.players, this.create_player_cards.bind(this))
  }

  create_player_cards(player) {
    let copper = new Copper()
    let estate = new Estate()

    coppers = _.times(7, function() { return copper.to_h() })
    estates = _.times(3, function() { return estate.to_h() })

    deck = _.shuffle(coppers.concat(estates))
    hand = _.take(deck, 5)
    deck = _.drop(deck, 5)

    PlayerCards.insert({
      player_id: player._id,
      game_id: this.game._id,
      username: player.username,
      deck: deck,
      discard: [],
      playing: [],
      in_play: [],
      revealed: [],
      duration: [],
      haven: [],
      native_village: [],
      island: [],
      hand: hand,
      pirate_ship_coins: 0,
      victory_tokens: 0
    })
  }

  assign_game_to_players() {
    _.each(this.players, (player) => {
      Meteor.users.update(player._id, {
        $set: {current_game: this.game._id}
      })
    })
  }

  game_cards() {
    this.selected_kingdom_cards = this.kingdom_cards()
    this.use_prosperity_cards = this.prosperity_game()
    this.selected_common_cards = this.common_cards()
    this.trade_route_game()
    return this.selected_kingdom_cards.concat(this.selected_common_cards)
  }

  kingdom_cards() {
    return _.chain(this.cards).map((card) => {
      return this.game_card(card, 'kingdom')
    }).sortBy(function(card) {
      return -(card.top_card.coin_cost + (card.top_card.potion_cost * .1))
    }).value()
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
    if (this.use_prosperity_cards) {
      treasure_cards.unshift('Platinum')
    }
    return treasure_cards
  }

  miscellaneous_card_names() {
    return ['Curse']
  }

  game_card(card, source) {
    let card_stack = this.create_card_stack(card)
    return {
      name: card.name,
      count: _.size(card_stack),
      embargos: 0,
      top_card: _.first(card_stack),
      stack: card_stack,
      source: source
    }
  }

  create_card_stack(card) {
    return _.times(this.stack_size(card), function(counter) {
      return card
    })
  }

  stack_size(card) {
    if (_.contains(card.types, 'victory')) {
      return _.size(this.players) < 3 ? 8 : 12
    } else if (card.name === 'Curse') {
      return _.size(this.players) === 1 ? 10 : _.size(this.players) * 10 - 10
    } else if (card.name === 'Copper') {
      return 60
    } else if (card.name === 'Silver') {
      return 40
    } else if (card.name === 'Gold') {
      return 30
    } else if (card.name === 'Platinum') {
      return 12
    } else {
      return 10
    }
  }

  has_duchess(cards) {
    return _.find(cards, function(card) {
      return card.name === 'Duchess'
    }) !== undefined
  }

  prosperity_game() {
    let card_names = CardList.prosperity()
    let count = _.size(_.filter(this.selected_kingdom_cards, function(card) {
      return _.contains(card_names, _.titleize(card.name))
    }))
    return count >= this.random_number(1, _.size(this.selected_kingdom_cards))
  }

  trade_route_game() {
    let card_names = _.pluck(this.selected_kingdom_cards, 'name')
    if (_.contains(card_names, 'Trade Route')) {
      this.selected_kingdom_cards = _.map(this.selected_kingdom_cards, this.set_trade_route_tokens)
      this.selected_common_cards = _.map(this.selected_common_cards, this.set_trade_route_tokens)
    }
  }

  set_trade_route_tokens(card) {
    if (card.name != 'Knights' && _.contains(card.top_card.types, 'victory')) {
      card.has_trade_route_token = true
    }
    return card
  }

  random_number(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

}
