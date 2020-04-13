Card = class Card {

  potion_cost() {
    return 0
  }

  debt_cost() {
    return 0
  }

  victory_points() {
    return 0
  }

  point_variable() {
    return false
  }

  name() {
    return _.startCase(this.constructor.name)
  }

  image() {
    return _.snakeCase(this.constructor.name)
  }

  stack_name() {
    return this.name()
  }

  type_class() {
    return this.types().join(' ')
  }

  move_to_tavern(game, player_cards, reserve_card) {
    let reserve_index = _.findIndex(player_cards.playing, function(card) {
      return card.id === reserve_card.id
    })
    if (reserve_index !== -1) {
      let reserve_card = player_cards.playing.splice(reserve_index, 1)[0]
      delete reserve_card.prince
      if (reserve_card.misfit) {
        reserve_card = reserve_card.misfit
      }
      player_cards.tavern.push(reserve_card)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(reserve_card)} on their Tavern`)
    }
  }

  stay_in_play(player_cards, card) {
    if (card.belongs_to_id) {
      let belongs_to = _.find(player_cards.in_play, (in_play_card) => {
        return in_play_card.id === card.belongs_to_id
      })
      return ClassCreator.create(belongs_to.name).stay_in_play(player_cards, belongs_to)
    } else {
      return false
    }
  }

  to_h(player_cards) {
    return {
      name: this.name(),
      image: this.image(),
      types: this.types().join(' '),
      coin_cost: this.coin_cost(),
      potion_cost: this.potion_cost(),
      debt_cost: this.debt_cost(),
      stack_name: this.stack_name()
    }
  }

  static place_revealed_cards_on_deck(game, player_cards) {
    if (_.size(player_cards.revealed) === 1) {
      Card.replace_cards(game, player_cards, player_cards.revealed)
    } else if (_.size(player_cards.revealed) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'sort_cards',
        instructions: 'Choose order to place cards on deck: (leftmost will be top card)',
        cards: player_cards.revealed
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Card.replace_cards)
    }
  }

  static replace_cards(game, player_cards, ordered_cards) {
    _.each(ordered_cards.reverse(), function(ordered_card) {
      let card_mover = new CardMover(game, player_cards)
      card_mover.move(player_cards.revealed, player_cards.deck, ordered_card)
    })
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places the remaining cards back on their deck`)
    delete player_cards.revealed
  }

}
