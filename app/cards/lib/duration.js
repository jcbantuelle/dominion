Duration = class Duration extends Card {

  stay_in_play(game, player_cards, card) {
    return _.find(player_cards.duration_effects, (duration_effect) => {
      return duration_effect.id === card.id
    }) || super.stay_in_play(game, player_cards, card)
  }

}
