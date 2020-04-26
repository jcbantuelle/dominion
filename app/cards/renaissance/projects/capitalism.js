Capitalism = class Capitalism extends Project {

  coin_cost() {
    return 5
  }

  buy(game, player_cards) {
    player_cards.capitalism = true
    Capitalism.convert_cards(game, player_cards, true)
    console.log(player_cards.hand)
  }

  static convert_cards(game, player_cards, convert) {
    let turn_ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, player_cards)
    turn_ordered_player_cards.shift()
    turn_ordered_player_cards.unshift(player_cards)
    _.each(turn_ordered_player_cards, (next_player_cards) => {
      _.each(AllPlayerCardsQuery.card_sources(), (source) => {
        next_player_cards[source] = _.map(_.clone(next_player_cards[source]), (card) => {
          return Capitalism.convert_card(card, convert)
        })
      })
      PlayerCardsModel.update(game._id, next_player_cards)
    })

    game.trash = _.map(_.clone(game.trash), (card) => {
      return Capitalism.convert_card(card, convert)
    })

    game.cards = _.map(_.clone(game.cards), (pile) => {
      pile.stack = _.map(pile.stack, (card) => {
        return Capitalism.convert_card(card, convert)
      })
      pile.top_card = Capitalism.convert_card(pile.top_card, convert)
      return pile
    })
    GameModel.update(game._id, game)
  }

  static convert_card(card, convert) {
    let converted_card = card
    if (converted_card.capitalism) {
      converted_card = convert ? Capitalism.add_treasure(converted_card) : Capitalism.remove_treasure(converted_card)
    }
    return converted_card
  }

  static add_treasure(card) {
    let card_types = _.words(card.types)
    card_types.push('treasure')
    card.types = card_types.join(' ')
    return card
  }

  static remove_treasure(card) {
    let card_types = _.filter(_.words(card.types), (card_type) => {
      return card_type !== 'treasure'
    })
    card.types = card_types.join(' ')
    return card
  }

}
