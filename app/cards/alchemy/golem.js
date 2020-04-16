Golem = class Golem extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  potion_cost() {
    return 1
  }

  play(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;but there are no cards in their deck`)
    } else {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck_until((game, revealed_cards) => {
        let actions = _.filter(revealed_cards, (card) => {
          return _.includes(_.words(card.types), 'action') && card.name !== 'Golem'
        })
        return _.size(actions) === 2
      })

      let non_actions = _.filter(player_cards.revealed, (card) => {
        return !_.includes(_.words(card.types), 'action') || card.name === 'Golem'
      })
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed', non_actions)
      card_discarder.discard()

      if (_.isEmpty(player_cards.revealed)) {
        game.log.push(`&nbsp;&nbsp;but there are no action cards to play`)
      } else {
        PlayerCardsModel.update(game._id, player_cards)
        GameModel.update(game._id, game)

        player_cards.golem_actions = player_cards.revealed
        player_cards.revealed = []

        if (_.size(player_cards.golem_actions) === 2) {
          let turn_event_id = TurnEventModel.insert({
            game_id: game._id,
            player_id: player_cards.player_id,
            username: player_cards.username,
            type: 'choose_cards',
            player_cards: true,
            instructions: 'Choose which card to play first:',
            cards: player_cards.golem_actions,
            minimum: 1,
            maximum: 1
          })
          let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
          turn_event_processor.process(Golem.play_action)
        }
        Golem.play_action(game, player_cards, player_cards.golem_actions)
      }
    }
  }

  static play_action(game, player_cards, selected_cards) {
    let card_player = new CardPlayer(game, player_cards, selected_cards[0])
    card_player.play(true, true, 'golem_actions')
  }

}
