Bandit = class Bandit extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Gold')
    card_gainer.gain()

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)
  }

  attack(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(2)

      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)

      let revealed_treasures = _.filter(player_cards.revealed, (card) => {
        return _.includes(_.words(card.types), 'treasure') && card.name !== 'Copper'
      })
      if (_.size(revealed_treasures) === 1) {
        Bandit.trash_treasure(game, player_cards, revealed_treasures)
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
        turn_event_processor.process(Bandit.trash_treasure)
      }
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard()
    }
  }

  static trash_treasure(game, player_cards, selected_cards) {
    let card_trasher = new CardTrasher(game, player_cards, 'revealed', selected_cards)
    card_trasher.trash()
  }

}
