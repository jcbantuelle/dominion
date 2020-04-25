Scepter = class Scepter extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose One:`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: '+$2', value: 'coin'},
        {text: 'Replay an Action', value: 'action'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    let choice = turn_event_processor.process(Scepter.process_response)

    if (choice === 'coin') {
      let coin_gainer = new CoinGainer(game, player_cards)
      coin_gainer.gain(2)
    } else {
      let played_action_ids = _.map(game.turn.played_actions, 'id')
      let replayable_actions = _.filter(player_cards.in_play, (card) => {
        return _.includes(_.words(card.types), 'action') && _.includes(played_action_ids, card.id)
      })
      if (_.size(replayable_actions) > 1) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose an action to replay:',
          cards: replayable_actions,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card_player.card)
        turn_event_processor.process(Scepter.replay_action)
      } else if (_.size(replayable_actions) === 1) {
        Scepter.replay_action(game, player_cards, replayable_actions, card_player.card)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no available actions to replay`)
      }
    }
  }

  static process_response(game, player_cards, response, scepter) {
    return response[0]
  }

  static replay_action(game, player_cards, selected_cards, scepter) {
    let card_player = new CardPlayer(game, player_cards, selected_cards[0], scepter)
    card_player.play(true, false, 'in_play')
  }

}
