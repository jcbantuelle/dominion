Bandit = class Bandit extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Gold')
    card_gainer.gain_game_card()

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)
  }

  attack(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      player_cards.revealed = _.take(player_cards.deck, 2)
      player_cards.deck = _.drop(player_cards.deck, 2)

      let revealed_card_count = _.size(player_cards.revealed)
      if (revealed_card_count < 2 && _.size(player_cards.discard) > 0) {
        DeckShuffler.shuffle(game, player_cards)
        player_cards.revealed = player_cards.revealed.concat(_.take(player_cards.deck, 2 - revealed_card_count))
        player_cards.deck = _.drop(player_cards.deck, 2 - revealed_card_count)
      }

      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.revealed)}`)
      GameModel.update(game._id, game)

      let revealed_treasures = _.filter(player_cards.revealed, function(card) {
        return _.includes(_.words(card.types), 'treasure') && card.name !== 'Copper'
      })
      if (_.size(revealed_treasures) === 1) {
        let card_trasher = new CardTrasher(game, player_cards, 'revealed', revealed_treasures[0].name)
        card_trasher.trash()
      } else if (_.size(revealed_treasures) > 1) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: `Choose a treasure to trash:`,
          cards: revealed_treasures,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Bandit.choose_trashed_treasure)
      }
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard()
    }
  }

  static choose_trashed_treasure(game, player_cards, selected_cards) {
    let card_trasher = new CardTrasher(game, player_cards, 'revealed', selected_cards[0].name)
    card_trasher.trash()
  }

}
