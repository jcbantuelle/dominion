CardMover = class CardMover {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
  }

  move(source, destination, card, destination_index = 0) {
    let card_index = _.findIndex(source, function(source_card) {
      return source_card.id === card.id
    })
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

}
