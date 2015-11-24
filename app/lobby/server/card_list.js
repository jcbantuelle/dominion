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
    return CardList.base().concat(CardList.seaside()).concat(CardList.hinterlands()).concat(CardList.prosperity())
  }

  static base() {
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

  static seaside() {
    return [
      'Embargo',
      'Haven',
      'Lighthouse',
      'NativeVillage',
      'PearlDiver',
      'Ambassador',
      'FishingVillage',
      'Lookout',
      'Smugglers',
      'Warehouse',
      'Caravan',
      'Cutpurse',
      'Island',
      'Navigator',
      'PirateShip',
      'Salvager',
      'SeaHag',
      'TreasureMap',
      'Bazaar',
      'Explorer',
      'GhostShip',
      'MerchantShip',
      'Outpost',
      'Tactician',
      'Treasury',
      'Wharf'
    ]
  }

  static hinterlands() {
    return [
      'Crossroads',
      'Duchess',
      'FoolsGold',
      'Develop',
      'Oasis',
      'Oracle',
      'Scheme',
      'Tunnel',
      'JackOfAllTrades',
      'NobleBrigand',
      'NomadCamp',
      'SilkRoad',
      'SpiceMerchant',
      'Trader',
      'Cache',
      'Cartographer',
      'Embassy',
      'Haggler',
      'Highway',
      'IllGottenGains',
      'Inn',
      'Mandarin',
      'Margrave',
      'Stables',
      'BorderVillage',
      'Farmland'
    ]
  }

  static prosperity() {
    return [
      'Loan',
      'TradeRoute',
      'Watchtower',
      'Bishop',
      'Monument',
      'Quarry',
      'Talisman',
      'WorkersVillage',
      'City',
      'Contraband',
      'CountingHouse',
      'Mint',
      'Mountebank',
      /*'Rabble',
      'RoyalSeal',
      'Vault',
      'Venture',
      'Goons',
      'GrandMarket',
      'Hoard',
      'Bank',
      'Expand',
      'Forge',
      'KingsCourt',
      'Peddler'*/
    ]
  }
}
