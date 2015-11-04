CardList = class CardList {

  constructor() {
    this.cards = this.card_list()
  }

  pull_set() {
    return _.chain(this.cards).sample(10).map(function(card_name) {
      return ClassCreator.create(card_name).to_h()
    }).value()
  }

  card_list() {
    return this.base().concat(this.seaside())
  }

  base() {
    return [
      'Cellar',
      'Chapel',
      'Moat',
      'Chancellor',
      'Village',
      'Woodcutter',
      'Workshop',
      'Bureaucrat',
      'Feast',
      'Gardens',
      'Militia',
      'Moneylender',
      'Remodel',
      'Smithy',
      'Spy',
      'Thief',
      'ThroneRoom',
      'CouncilRoom',
      'Festival',
      'Laboratory',
      'Library',
      'Market',
      'Mine',
      'Witch',
      'Adventurer'
    ]
  }

  seaside() {
    return [
      'SeaHag',
      'Warehouse',
      'Bazaar',
      'PearlDiver'
    ]
  }
}
