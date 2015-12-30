CardList = class CardList {

  constructor(exclusions) {
    this.cards = CardList.full_list(exclusions)
  }

  pull_set() {
    return _.chain(this.cards).sample(10).map(function(card_name) {
      return ClassCreator.create(card_name).to_h()
    }).value()
  }

  static sets() {
    return ['base', 'intrigue', 'seaside', 'alchemy', 'prosperity', 'cornucopia', 'hinterlands', 'dark_ages', 'guilds', 'promo', 'adventures']
  }

  static pull_one() {
    return ClassCreator.create(_.sample(CardList.full_list(), 1)).to_h()
  }

  static full_list(exclusions = []) {
    return _.reduce(CardList.sets(), function(card_list, set) {
      if (!_.contains(exclusions, set)) {
        card_list = card_list.concat(CardList[set]())
      }
      return card_list
    }, [])
  }

  static adventures() {
    return [
      'CoinOfTheRealm',
      'Page',
      'Peasant',
      'Ratcatcher',
      'Raze',
      'Amulet',
      'CaravanGuard',
      'Dungeon',
      'Gear',
      'Guide',
      'Duplicate',
      'Magpie',
      'Messenger',
      'Miser',
      'Port',
      'Ranger',
      'Transmogrify',
      'Artificer',
      'BridgeTroll',
      'DistantLands',
      'Giant',
      'HauntedWoods',
      'LostCity',
      'Relic',
      /*'RoyalCarriage',
      'Storyteller',
      'SwampHag',
      'TreasureTrove',
      'WineMerchant',
      'Hireling'*/
    ]
  }

  static promo() {
    return [
      'BlackMarket',
      'Envoy',
      'WalledVillage',
      'Governor',
      'Stash',
      'Prince'
    ]
  }

  static guilds() {
    return [
      'CandlestickMaker',
      'Stonemason',
      'Doctor',
      'Masterpiece',
      'Advisor',
      'Herald',
      'Plaza',
      'Taxman',
      'Baker',
      'Butcher',
      'Journeyman',
      'MerchantGuild',
      'Soothsayer'
    ]
  }

  static dark_ages() {
    return [
      'PoorHouse',
      'Beggar',
      'Squire',
      'Vagrant',
      'Forager',
      'Hermit',
      'MarketSquare',
      'Sage',
      'Storeroom',
      'Urchin',
      'Armory',
      'DeathCart',
      'Feodum',
      'Fortress',
      'Ironmonger',
      'Marauder',
      'Procession',
      'Rats',
      'Scavenger',
      'Knights',
      'WanderingMinstrel',
      'BandOfMisfits',
      'BanditCamp',
      'Catacombs',
      'Count',
      'Counterfeit',
      'Cultist',
      'Graverobber',
      'JunkDealer',
      'Mystic',
      'Pillage',
      'Rebuild',
      'Rogue',
      'Altar',
      'HuntingGrounds'
    ]
  }

  static cornucopia() {
    return [
      'Hamlet',
      'FortuneTeller',
      'Menagerie',
      'FarmingVillage',
      'HorseTraders',
      'Remake',
      'Tournament',
      'YoungWitch',
      'Harvest',
      'HornOfPlenty',
      'HuntingParty',
      'Jester',
      'Fairgrounds'
    ]
  }

  static intrigue() {
    return [
      'Courtyard',
      'Pawn',
      'SecretChamber',
      'GreatHall',
      'Masquerade',
      'ShantyTown',
      'Steward',
      'Swindler',
      'WishingWell',
      'Baron',
      'Bridge',
      'Conspirator',
      'Coppersmith',
      'Ironworks',
      'MiningVillage',
      'Scout',
      'Duke',
      'Minion',
      'Saboteur',
      'Torturer',
      'TradingPost',
      'Tribute',
      'Upgrade',
      'Harem',
      'Nobles'
    ]
  }

  static alchemy() {
    return [
      'Transmute',
      'Vineyard',
      'Apothecary',
      'Herbalist',
      'ScryingPool',
      'University',
      'Alchemist',
      'Familiar',
      'PhilosophersStone',
      'Golem',
      'Apprentice',
      'Possession'
    ]
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
      'Rabble',
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
      'Peddler'
    ]
  }
}
