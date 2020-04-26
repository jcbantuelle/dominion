CardCostComparer = class CardCostComparer {

  static coin_equal_to(game, card, coin) {
    return card.potion_cost === 0 && card.debt_cost === 0 && CostCalculator.calculate(game, card) === coin
  }

  static cost_equal_to(game, card, coin, potion, debt) {
    return card.potion_cost === potion && card.debt_cost === debt && CostCalculator.calculate(game, card) === coin
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
    return comparee.potion_cost === comparer.potion_cost && comparee.debt_cost === comparer.debt_cost && CostCalculator.calculate(game, comparee) === (CostCalculator.calculate(game, comparer) + coin_modifier)
  }

  static card_less_than(game, comparer, comparee, coin_modifier = 0) {
    let comparer_coin_cost = CostCalculator.calculate(game, comparer) + coin_modifier
    let comparee_coin_cost = CostCalculator.calculate(game, comparee)

    let less_coin = (comparee.potion_cost <= comparer.potion_cost && comparee.debt_cost <= comparer.debt_cost && comparee_coin_cost < comparer_coin_cost)
    let less_potion = (comparee.potion_cost < comparer.potion_cost && comparee.debt_cost <= comparer.debt_cost && comparee_coin_cost <= comparer_coin_cost)
    let less_debt = (comparee.potion_cost <= comparer.potion_cost && comparee.debt_cost < comparer.debt_cost && comparee_coin_cost <= comparer_coin_cost)
    return less_coin || less_potion || less_debt
  }

}
