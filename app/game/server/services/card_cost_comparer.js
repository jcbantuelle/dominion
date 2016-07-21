CardCostComparer = class CardCostComparer {

  static coin_equal_to(game, card, coin) {
    return card.potion_cost === 0 && card.debt_cost === 0 && CostCalculator.calculate(game, card) === coin
  }

  static coin_less_than(game, card, coin) {
    return card.potion_cost === 0 && card.debt_cost === 0 && CostCalculator.calculate(game, card) < coin
  }

  static coin_greater_than(game, card, coin) {
    return CostCalculator.calculate(game, card) > coin
  }

  static coin_between(game, card, low, high) {
    let cost = CostCalculator.calculate(game, card)
    return cost >= low && cost <= high && card.potion_cost === 0 && card.debt_cost === 0
  }

  static card_equal_to(game, comparer, comparee, coin_modifier = 0) {
    let all_player_cards = PlayerCardsModel.find(game._id)
    return comparee.potion_cost === comparer.potion_cost && comparee.debt_cost === comparer.debt_cost && CostCalculator.calculate(game, comparee, all_player_cards) === (CostCalculator.calculate(game, comparer, all_player_cards) + coin_modifier)
  }

  static card_less_than(game, comparer, comparee, coin_modifier = 0) {
    let all_player_cards = PlayerCardsModel.find(game._id)
    let comparer_coin_cost = CostCalculator.calculate(game, comparer, all_player_cards) + coin_modifier
    let comparee_coin_cost = CostCalculator.calculate(game, comparee, all_player_cards)

    let less_coin = (comparee.potion_cost <= comparer.potion_cost && comparee.debt_cost <= comparer.debt_cost && comparee_coin_cost < comparer_coin_cost)
    let less_potion = (comparee.potion_cost < comparer.potion_cost && comparee.debt_cost <= comparer.debt_cost && comparee_coin_cost <= comparer_coin_cost)
    let less_debt = (comparee.potion_cost <= comparer.potion_cost && comparee.debt_cost < comparer.debt_cost && comparee_coin_cost <= comparer_coin_cost)
    return less_coin || less_potion || less_debt
  }

}
