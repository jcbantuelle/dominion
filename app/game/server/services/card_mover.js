CardMover = class CardMover {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
  }

  move(source, destination, card, destination_index = 0) {
    let card_index = this.card_index(source, card)
    if (card_index !== -1) {
      source.splice(card_index, 1)
      destination.splice(destination_index, 0, card)
      return true
    } else {
      return false
    }
  }

  move_all(source, destination) {
    _.times(_.size(source), (count) => {
      let card = source.splice(0, 1)
      destination.splice(0, 0, card[0])
    })
  }

  return_to_supply(source, supply_name, cards) {
    let supply_pile = _.find(this.game.cards, (pile) => {
      return pile.name === supply_name
    })
    let return_count = 0
    _.each(cards, (card) => {
      let card_index = this.card_index(source, card)
      if (card_index !== -1) {
        source.splice(card_index, 1)
        supply_pile.count += 1
        supply_pile.stack.splice(0, 0, card)
        supply_pile.top_card = card
        return_count += 1
      }
    })
    return return_count
  }

  take_from_supply(destination, supply_name) {
    let supply_pile = _.find(this.game.cards, (pile) => {
      return pile.name === supply_name
    })
    if (supply_pile && supply_pile.count > 0) {
      let card = supply_pile.stack.splice(0, 1)[0]
      destination.splice(0, 0, card)
      supply_pile.count -= 1

      if (supply_pile.count > 0) {
        supply_pile.top_card = _.head(supply_pile.stack)
      }
      return true
    } else {
      return false
    }
  }

  card_index(source, card) {
    return _.findIndex(source, (source_card) => {
      return source_card.id === card.id
    })
  }

}
