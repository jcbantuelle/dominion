NobleBrigand = class NobleBrigand extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(1)

    game.turn.trashed_treasures = []
    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)
    this.gain_trashed_cards(game, player_cards)
  }

  buy_event(buyer) {
    buyer.game.turn.trashed_treasures = []
    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(buyer.game, buyer.player_cards)
    ordered_player_cards.shift()
    _.each(ordered_player_cards, (other_player_cards) => {
      this.attack(buyer.game, other_player_cards)
      PlayerCardsModel.update(buyer.game._id, other_player_cards)
    })
    this.gain_trashed_cards(buyer.game, buyer.player_cards)
  }

  attack(game, player_cards) {
    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal_from_deck(2)

    GameModel.update(game._id, game)

    let revealed_treasures = _.filter(player_cards.revealed, function(card) {
      return _.includes(['Silver', 'Gold'], card.name)
    })
    if (_.size(revealed_treasures) === 1) {
      NobleBrigand.trash_treasure(game, player_cards, revealed_treasures)
    } else if (_.size(revealed_treasures) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: game.turn.player._id,
        username: game.turn.player.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose one of <strong>${player_cards.username}'s</strong> treasures to trash:`,
        cards: revealed_treasures,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(NobleBrigand.trash_treasure)
    } else {
      let any_treasures = _.some(player_cards.revealed, function(card) {
        return _.includes(_.words(card.types), 'treasure')
      })

      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard()

      if (!any_treasures) {
        let card_gainer = new CardGainer(game, player_cards, 'discard', 'Copper')
        card_gainer.gain()
      }
    }
  }

  gain_trashed_cards(game, player_cards) {
    _.each(game.turn.trashed_treasures, function(treasure) {
      let card_gainer = new CardGainer(game, player_cards, 'discard', treasure.name)
      card_gainer.gain(game.trash)
    })
    delete game.turn.trashed_treasure
  }

  static trash_treasure(game, player_cards, trashed_treasure) {
    game.turn.trashed_treasures.push(trashed_treasure[0])
    let card_trasher = new CardTrasher(game, player_cards, 'revealed', trashed_treasure)
    card_trasher.trash()

    let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
    card_discarder.discard()

    GameModel.update(game._id, game)
  }

}
