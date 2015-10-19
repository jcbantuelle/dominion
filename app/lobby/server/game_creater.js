GameCreater = class GameCreater {

  constructor(players, cards) {
    this.players = players
    this.cards = cards
  }

  create() {
    this.game_id = this.create_game()
    this.start_game_log()
    this.assign_game_to_players()
  }

  create_game() {
    return Games.insert({
      players: _.shuffle(this.players),
      kingdom_cards: this.kingdom_cards(),
      common_cards: this.common_cards(),
      trash: [],
      log: [],
      turn: 1
    })
  }

  start_game_log() {
    let game = Games.findOne(this.game_id)
    let turn_order =  _.map(game.players, function(player) {
      return player.username
    })

    game.log = [
      `Turn Order is: ${turn_order.join(', ')}`,
      `<strong>- ${_.first(game.players).username}'s turn 1 -</strong>`
    ]

    Games.update(this.game_id, game)
  }
    })
  }

  assign_game_to_players() {
    _.each(this.players, (player) => {
      Meteor.users.update(player._id, {
        $set: {current_game: this.game_id}
      })
    })
  }

  kingdom_cards() {
    return _.map(this.cards, (card) => {
      return this.game_card(card)
    })
  }

  common_cards() {
    let cards = _.map(this.common_card_names(), function(card_name) {
      let card = new this[card_name]
      return card.to_h()
    })

    return _.map(cards, (card) => {
      return this.game_card(card)
    })
  }

  common_card_names() {
    return this.victory_card_names().concat(this.treasure_card_names()).concat(this.miscellaneous_card_names())
  }

  victory_card_names() {
    return ['Estate','Duchy','Province']
  }

  treasure_card_names() {
    return ['Copper','Silver','Gold']
  }

  miscellaneous_card_names() {
    return ['Curse']
  }

  game_card(card) {
    let card_stack = this.create_card_stack(card)
    return {
      name: card.name,
      count: _.size(card_stack),
      top_card: _.first(card_stack),
      stack: card_stack
    }
  }

  create_card_stack(card) {
    return _.times(this.stack_size(card), function(counter) {
      return card
    })
  }

  stack_size(card) {
    if (s.include(card.types, 'victory')) {
      return _.size(this.players) < 3 ? 8 : 12
    } else if (card.name === 'Curse') {
      return _.size(this.players) === 1 ? 10 : _.size(this.players) * 10 - 10
    } else if (card.name === 'Copper') {
      return 60
    } else if (card.name === 'Silver') {
      return 40
    } else if (card.name === 'Gold') {
      return 30
    } else {
      return 10
    }
  }

}
