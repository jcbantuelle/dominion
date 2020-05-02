CardMover = class CardMover {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
  }

  move(source, destination, card, destination_index = 0) {
    let card_index = this.card_index(source, card)
    if (card_index !== -1) {
      source.splice(card_index, 1)
      delete card.face_down
      let investment_index = _.findIndex(this.player_cards.investments, (investment) => {
        return investment.id === card.id
      })
      if (investment_index !== -1) {
        this.player_cards.investments.splice(investment_index, 1)
      }
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
      return pile.stack_name === supply_name
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

  take_from_supply(destination, gained_card) {
    let supply_pile = _.find(this.game.cards, (pile) => {
      return pile.top_card.name === gained_card.name
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

  take_unique_card(source, unique_card_name) {
    let card_source = this.player_cards[source]
    let unique_card = this.find_unique_card(card_source, unique_card_name)

    if (!unique_card) {
      card_source = this.game[source]
      unique_card = this.find_unique_card(card_source, unique_card_name)
      let last_checked_player_cards
      if (!unique_card) {
        let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(this.game, this.player_cards)
        ordered_player_cards.shift()
        _.each(ordered_player_cards, (next_player_cards) => {
          last_checked_player_cards = next_player_cards
          card_source = next_player_cards[source]
          unique_card = this.find_unique_card(card_source, unique_card_name)
          if (unique_card) {
            return false
          }
        })
      }
      this.move(card_source, this.player_cards[source], unique_card)
      if (last_checked_player_cards) {
        PlayerCardsModel.update(this.game._id, last_checked_player_cards)
      }
      this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> takes ${CardView.render(unique_card)}`)
      return true
    } else {
      this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> already has ${CardView.render(unique_card)}`)
      return false
    }
  }

  find_unique_card(card_source, card_name) {
    return _.find(card_source, (unique_card) => {
      return unique_card.name === card_name
    })
  }

}
