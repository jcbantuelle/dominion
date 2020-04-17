Jester = class Jester extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)
  }

  attack(game, player_cards, attacker) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      if (_.size(player_cards.deck) === 0) {
        let deck_shuffler = new DeckShuffler(game, player_cards)
        deck_shuffler.shuffle()
      }

      let top_card = player_cards.deck[0]

      let card_discarder = new CardDiscarder(game, player_cards, 'deck', top_card)
      card_discarder.discard()

      if (_.includes(_.words(top_card.types), 'victory')) {
        let card_gainer = new CardGainer(game, player_cards, 'discard', 'Curse')
        card_gainer.gain()
      } else {
        let game_card = _.find(game.cards, function(card) {
          return card.supply && card.count > 0 && card.top_card.name === top_card.name
        })
        if (game_card) {
          GameModel.update(game._id, game)
          let turn_event_id = TurnEventModel.insert({
            game_id: game._id,
            player_id: game.turn.player._id,
            username: game.turn.player.username,
            type: 'choose_options',
            instructions: `Choose who should gain a copy of ${CardView.render(top_card)}:`,
            minimum: 1,
            maximum: 1,
            options: [
              {text: `${game.turn.player.username}`, value: 'self'},
              {text: `${player_cards.username}`, value: 'opponent'}
            ]
          })
          let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, {attacker: attacker, top_card: top_card})
          turn_event_processor.process(Jester.process_response)
        } else {
          game.log.push(`&nbsp;&nbsp;but nobody gains a copy of ${CardView.render(top_card)} because it is not in the supply`)
        }
      }
    }

  }

  static process_response(game, player_cards, response, params) {
    let who_gains_card = response[0] === 'self' ? params.attacker : player_cards

    let card_gainer = new CardGainer(game, who_gains_card, 'discard', params.top_card.name)
    card_gainer.gain()

    PlayerCardsModel.update(game._id, who_gains_card)
  }

}
