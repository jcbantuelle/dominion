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
    _.each(cards, (card) => {
      source.splice(this.card_index(source, card), 1)
      supply_pile.count += 1
      supply_pile.stack.splice(0, 0, card)
      supply_pile.top_card = card
    })
  }

  card_index(source, card) {
    return _.findIndex(source, (source_card) => {
      return source_card.id === card.id
    })
  }

}
