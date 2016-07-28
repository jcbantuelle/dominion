AllPlayerCardsQuery = class AllPlayerCardsQuery {

  static card_sources() {
    return ['hand', 'discard', 'deck', 'playing', 'in_play', 'revealed', 'duration', 'haven', 'native_village', 'island', 'horse_traders', 'to_discard', 'discarding', 'prince', 'princed', 'tavern', 'permanent', 'gear', 'save', 'estate', 'encampments', 'archive']
  }

  static find(player_cards, include_source = false) {
    return _.reduce(AllPlayerCardsQuery.card_sources(), function(all_cards, source) {
      let source_cards = _.map(player_cards[source], function(card) {
        if (include_source) {
          card.source = source
        }
        return card
      })
      return all_cards.concat(source_cards)
    }, [])
  }

}
