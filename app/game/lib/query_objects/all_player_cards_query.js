AllPlayerCardsQuery = class AllPlayerCardsQuery {

  static card_sources() {
    return [
      'archive',
      'aside',
      'cargo_ship',
      'church',
      'crypt',
      'deck',
      'discard',
      'gear',
      'hand',
      'haven',
      'in_play',
      'inheritance',
      'island',
      'native_village',
      'revealed',
      'tavern'
    ]
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
