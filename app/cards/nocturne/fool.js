Fool = class Fool extends Card {

  types() {
    return ['action', 'fate']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let lost_in_the_woods_index = _.findIndex(player_cards.states, function(state) {
      return state.name === 'Lost In The Woods'
    })

    if (lost_in_the_woods_index === -1) {
      let lost_in_the_woods = null
      let game_lost_in_the_woods_index = _.findIndex(game.states, function(state) {
        return state.name === 'Lost In The Woods'
      })
      if (game_lost_in_the_woods_index === -1) {
        let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, player_cards)
        ordered_player_cards.shift()
        _.each(ordered_player_cards, function(other_player_cards) {
          let other_player_lost_in_the_woods_index = _.findIndex(other_player_cards.states, function(state) {
            return state.name === 'Lost In The Woods'
          })
          if (other_player_lost_in_the_woods_index !== -1) {
            lost_in_the_woods = other_player_cards.states.splice(other_player_lost_in_the_woods_index, 1)[0]
          }
          PlayerCardsModel.update(game._id, other_player_cards)
        })
      } else {
        lost_in_the_woods = game.states.splice(game_lost_in_the_woods_index, 1)[0]
      }
      player_cards.states.push(lost_in_the_woods)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> takes ${CardView.render(lost_in_the_woods)}`)

      revealed_boons = _.take(game.boons_deck, 3)
      game.boons_deck = _.drop(game.boons_deck, 3)

      let revealed_boon_count = _.size(revealed_boons)
      if (revealed_boon_count < 3 && _.size(game.boons_discard) > 0) {
        game.boons_deck = _.shuffle(game.boons_discard)
        game.boons_discard = []
        revealed_boons = revealed_boons.concat(_.take(game.boons_deck, 3 - revealed_boon_count))
        game.boons_deck = _.drop(game.boons_deck, 3 - revealed_boon_count)
      }
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(revealed_boons)}`)
      GameModel.update(game._id, game)

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose which Boon to receive next:',
        cards: revealed_boons,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, revealed_boons)
      turn_event_processor.process(Fool.receive_boon)
    } else {
      game.log.push(`&nbsp;&nbsp;but already has ${CardView.render(player_cards.states[lost_in_the_woods_index])}`)
    }
  }

  static receive_boon(game, player_cards, selected_cards, revealed_boons) {
    let selected_boon = selected_cards[0]
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> receives ${CardView.render(selected_boon)}`)
    GameModel.update(game._id, game)
    let boon = ClassCreator.create(selected_boon.name)
    let keep_boon = boon.receive(game, player_cards)
    if (keep_boon) {
      player_cards.boons.push(selected_boon)
    } else {
      game.boons_discard.unshift(selected_boon)
    }
    PlayerCardsModel.update(game._id, player_cards)
    GameModel.update(game._id, game)

    let selected_boon_index = _.findIndex(revealed_boons, function(revealed_boon) {
      return revealed_boon.id === selected_boon.id
    })
    revealed_boons.splice(selected_boon_index, 1)

    if (_.size(revealed_boons) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        show_images: true,
        instructions: 'Choose which Boon to receive next:',
        cards: revealed_boons,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, revealed_boons)
      turn_event_processor.process(Fool.receive_boon)
    } else if (_.size(revealed_boons) === 1) {
      Fool.receive_boon(game, player_cards, revealed_boons, revealed_boons)
    }
  }

}
