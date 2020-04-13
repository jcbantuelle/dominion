Thief = class Thief extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
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

      let revealed_treasures = _.filter(player_cards.revealed, function(card) {
        return _.includes(_.words(card.types), 'treasure')
      })
      if (_.size(revealed_treasures) === 1) {
        Thief.trash_treasure(game, player_cards, revealed_treasures)
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
        turn_event_processor.process(Thief.trash_treasure)
      }
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard()
    }
  }

  static trash_treasure(game, player_cards, selected_cards) {
    let card_trasher = new CardTrasher(game, player_cards, 'revealed', selected_cards[0])
    card_trasher.trash()

    GameModel.update(game._id, game)

    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: game.turn.player._id,
      username: game.turn.player.username,
      type: 'choose_yes_no',
      instructions: `Gain ${CardView.render(selected_cards[0])}?`,
      minimum: 1,
      maximum: 1
    })
    let attacker_player_cards = PlayerCardsModel.findOne(game._id, game.turn.player._id)
    let turn_event_processor = new TurnEventProcessor(game, attacker_player_cards, turn_event_id, selected_cards[0])
    turn_event_processor.process(Thief.gain_trashed_treasure)
  }

  static gain_trashed_treasure(game, player_cards, response, trashed_treasure) {
    if (response === 'yes') {
      let card_gainer = new CardGainer(game, player_cards, 'discard', trashed_treasure.name)
      card_gainer.gain_trash_card()
    }
  }

}
