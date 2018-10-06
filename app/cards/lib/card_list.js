CardList = class CardList {

  constructor(exclusions, edition) {
    this.edition = edition
    this.exclusions = exclusions
    this.cards = CardList.full_list(this.exclusions, this.edition)
  }

  pull_set() {
    let game_cards = _.sampleSize(this.cards, 10)

    let events_and_landmarks = _.filter(game_cards, (card_name) => {
      return _.includes(CardList.event_cards(this.edition).concat(CardList.landmark_cards(this.edition)), _.titleize(card_name))
    })
    let event_and_landmark_count = _.size(events_and_landmarks)
    if (event_and_landmark_count > 2) {
      game_cards = _.reject(game_cards, (card_name) => {
        return _.includes(CardList.event_cards(this.edition).concat(CardList.landmark_cards(this.edition)), _.titleize(card_name))
      })
      game_cards.push(events_and_landmarks[0])
      game_cards.push(events_and_landmarks[1])
    }
    if (event_and_landmark_count > 0) {
      game_cards = this.replace_events_and_landmarks(game_cards, event_and_landmark_count)
    }
    return _.map(game_cards, function(card_name) {
      return ClassCreator.create(card_name).to_h()
    })
  }

  pull_from_history(game_id) {
    let game_history = GameHistory.findOne(game_id)

    let game_cards = game_history.events.concat(game_history.landmarks).concat(_.filter(game_history.cards, function(card) {
      return card.source === 'kingdom'
    }))

    return _.map(game_cards, function(card) {
      return ClassCreator.create(card.name).to_h()
    })
  }

  replace_events_and_landmarks(game_cards, replacement_count) {
    let event_count = replacement_count
    var invalid_replacement
    _.times(replacement_count, () => {
      do {
        invalid_replacement = true
        let replacement_card_name = CardList.pull_one(this.exclusions, this.edition).name
        if (!_.includes(game_cards, _.titleize(replacement_card_name))) {
          if (_.includes(CardList.event_cards(this.edition).concat(CardList.landmark_cards(this.edition)), _.titleize(replacement_card_name))) {
            if (event_count < 2) {
              game_cards.push(replacement_card_name)
              event_count += 1
            }
          } else {
            game_cards.push(replacement_card_name)
            invalid_replacement = false
          }
        }
      } while (invalid_replacement)
    })
    return game_cards
  }

  static sets(edition = '') {
    return ['base'+edition, 'intrigue'+edition, 'seaside', 'alchemy', 'prosperity', 'cornucopia', 'hinterlands', 'dark_ages', 'guilds', 'promo', 'adventures', 'empires', 'nocturne', 'renaissance']
  }

  static event_sets(edition = '') {
    return ['adventures', 'promo', 'empires']
  }

  static landmark_sets(edition = '') {
    return ['empires']
  }

  static pull_one(exclusions = [], edition) {
    return ClassCreator.create(_.sample(CardList.full_list(exclusions, edition))).to_h()
  }

  static full_list(exclusions = [], edition) {
    return CardList.kingdom_cards(exclusions, edition).concat(CardList.event_cards(exclusions, edition)).concat(CardList.landmark_cards(exclusions, edition))
  }

  static kingdom_cards(exclusions = [], edition) {
    exclusions_for_edition = CardList.exclusions_for_edition(exclusions, edition)
    return _.reduce(CardList.sets(edition), function(card_list, set) {
      if (!_.includes(exclusions_for_edition, set)) {
        if (_.includes(['base', 'intrigue'], set)) {
          set = set+edition
        }
        card_list = card_list.concat(CardList[set]())
      }
      return card_list
    }, [])
  }

  static event_cards(exclusions = [], edition) {
    exclusions_for_edition = CardList.exclusions_for_edition(exclusions, edition)
    return _.reduce(CardList.event_sets(edition), function(card_list, set) {
      if (!_.includes(exclusions_for_edition, set)) {
        if (_.includes(['base', 'intrigue'], set)) {
          set = set+edition
        }
        card_list = card_list.concat(CardList[`${set}_events`]())
      }
      return card_list
    }, [])
  }

  static landmark_cards(exclusions = [], edition) {
    exclusions_for_edition = CardList.exclusions_for_edition(exclusions, edition)
    return _.reduce(CardList.landmark_sets(edition), function(card_list, set) {
      if (!_.includes(exclusions_for_edition, set)) {
        if (_.includes(['base', 'intrigue'], set)) {
          set = set+edition
        }
        card_list = card_list.concat(CardList[`${set}_landmarks`]())
      }
      return card_list
    }, [])
  }

  static exclusions_for_edition(exclusions, edition) {
    return _.map(exclusions, (exclusion) => {
      if (_.includes(['base', 'intrigue'], exclusion)) {
        return exclusion + edition
      } else {
        return exclusion
      }
    })
  }

  static empires_landmarks() {
    return [
      'Aqueduct',
      'Arena',
      'BanditFort',
      'Basilica',
      'Baths',
      'Battlefield',
      'Colonnade',
      'DefiledShrine',
      'Fountain',
      'Keep',
      'Labyrinth',
      'MountainPass',
      'Museum',
      'Obelisk',
      'Orchard',
      'Palace',
      'Tomb',
      'Tower',
      'TriumphalArch',
      'Wall',
      'WolfDen'
    ]
  }

  static adventures_events() {
    return [
      'Alms',
      'Borrow',
      'Quest',
      'Save',
      'ScoutingParty',
      'TravellingFair',
      'Bonfire',
      'Expedition',
      'Ferry',
      'Plan',
      'Mission',
      'Pilgrimage',
      'Ball',
      'Raid',
      'Seaway',
      'Trade',
      'LostArts',
      'Training',
      'Inheritance',
      'Pathfinding'
    ]
  }

  static promo_events() {
    return [
      'Summon'
    ]
  }

  static empires_events() {
    return [
      'Triumph',
      'Annex',
      'Donate',
      'Advance',
      'Delve',
      'Tax',
      'Banquet',
      'Ritual',
      'SaltTheEarth',
      'Wedding',
      'Windfall',
      'Conquest',
      'Dominate'
    ]
  }

  static nocturne() {
    return [
      'Druid',
      'FaithfulHound',
      'Guardian',
      'Monastery',
      'Pixie',
      'Tracker',
      'Changeling',
      'Fool',
      'GhostTown',
      'Leprechaun',
      'NightWatchman',
      'SecretCave',
      'Bard',
      'BlessedVillage',
      'Cemetery',
      'Conclave',
      'DevilsWorkshop',
      'Exorcist',
      'Necromancer',
      'Shepherd',
      'Skulk',
      'Cobbler',
      'Crypt',
      'CursedVillage',
      'DenOfSin',
      'Idol',
      'Pooka',
      'SacredGrove',
      'Tormentor',
      'TragicHero',
      'Vampire',
      'Werewolf',
      'Raider'
    ]
  }

  static renaissance() {
    return [
      'MountainVillage',
      'FlagBearer',
      'Scholar',
      'Experiment',
      'Seer',
      'Priest',
      'ActingTroupe',
      'Recruiter',
      'Sculptor',
      'SilkMerchant',
      'Ducat',
      'Villain',
      'Swashbuckler'
    ]
  }

  static empires() {
    return [
      'Engineer',
      'CityQuarter',
      'Overlord',
      'RoyalBlacksmith',
      'Encampment',
      'Patrician',
      'Settlers',
      'Castles',
      'Catapult',
      'ChariotRace',
      'Enchantress',
      'FarmersMarket',
      'Gladiator',
      'Sacrifice',
      'Temple',
      'Villa',
      'Archive',
      'Capital',
      'Charm',
      'Crown',
      'Forum',
      'Groundskeeper',
      'Legionary',
      'WildHunt'
    ]
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
      'RoyalCarriage',
      'Storyteller',
      'SwampHag',
      'TreasureTrove',
      'WineMerchant',
      'Hireling'
    ]
  }

  static promo() {
    return [
      'BlackMarket',
      'Envoy',
      'WalledVillage',
      'Governor',
      'Stash',
      'Prince',
      'Dismantle',
      'Sauna'
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

  static intrigue1() {
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

  static intrigue2() {
    return [
      'Courtyard',
      'Lurker',
      'Pawn',
      'Masquerade',
      'ShantyTown',
      'Steward',
      'Swindler',
      'WishingWell',
      'Baron',
      'Bridge',
      'Conspirator',
      'Ironworks',
      'Diplomat',
      'Mill',
      'SecretPassage',
      'MiningVillage',
      'Duke',
      'Minion',
      'Torturer',
      'Courtier',
      'Patrol',
      'Replace',
      'TradingPost',
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

  static base1() {
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

  static base2() {
    return [
      'Cellar',
      'Chapel',
      'Moat',
      'Village',
      'Harbinger',
      'Merchant',
      'Vassal',
      'Workshop',
      'Bureaucrat',
      'Poacher',
      'Gardens',
      'Militia',
      'Moneylender',
      'Remodel',
      'Smithy',
      'ThroneRoom',
      'CouncilRoom',
      'Festival',
      'Laboratory',
      'Bandit',
      'Sentry',
      'Library',
      'Market',
      'Mine',
      'Witch',
      'Artisan'
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
