BorderGuard = class BorderGuard extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    let lantern_index = _.findIndex(player_cards.artifacts, function(card) {
      return card.name === 'Lantern'
    })

    let card_count_to_reveal = lantern_index === -1 ? 2 : 3

    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;but has no cards in deck`)
    } else {
      player_cards.revealed = _.take(player_cards.deck, card_count_to_reveal)
      player_cards.deck = _.drop(player_cards.deck, card_count_to_reveal)

      let revealed_card_count = _.size(player_cards.revealed)
      if (revealed_card_count < card_count_to_reveal && _.size(player_cards.discard) > 0) {
        DeckShuffler.shuffle(game, player_cards)
        player_cards.revealed = player_cards.revealed.concat(_.take(player_cards.deck, card_count_to_reveal - revealed_card_count))
        player_cards.deck = _.drop(player_cards.deck, card_count_to_reveal - revealed_card_count)
      }

      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.revealed)}`)
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)

      if (_.size(player_cards.revealed) === 1) {
        player_cards.hand = player_cards.hand.concat(player_cards.revealed)
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(player_cards.revealed)} in their hand`)
      } else {
        let gain_artifact = _.size(player_cards.revealed) === card_count_to_reveal && _.every(player_cards.revealed, function(card) {
          return _.includes(_.words(card.types), 'action')
        })

        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: game.turn.player._id,
          username: game.turn.player.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: `Choose which card to put in hand:`,
          cards: player_cards.revealed,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, gain_artifact)
        turn_event_processor.process(BorderGuard.put_card_in_hand)
      }
    }
  }

  static put_card_in_hand(game, player_cards, selected_cards, gain_artifact) {
    let selected_card_index = _.findIndex(player_cards.revealed, function(card) {
      return card.name === selected_cards[0].name
    })

    player_cards.hand = player_cards.hand.concat(player_cards.revealed.splice(selected_card_index, 1)[0])
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(selected_cards)} in their hand`)

    let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
    card_discarder.discard()

    if (gain_artifact) {
      let lantern_index = _.findIndex(player_cards.artifacts, function(card) {
        return card.name === 'Lantern'
      })
      let horn_index = _.findIndex(player_cards.artifacts, function(card) {
        return card.name === 'Horn'
      })

      if (lantern_index !== -1 && horn_index !== -1) {
        game.log.push(`&nbsp;&nbsp;but <strong>${player_cards.username}</strong> already has ${CardView.render(new Lantern())} and ${CardView.render(new Horn())}`)
      } else if (lantern_index === -1 && horn_index === -1) {
        let artifacts = [(new Lantern()).to_h(), (new Horn()).to_h()]
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          boon: true,
          instructions: 'Choose which Artifact to take:',
          cards: artifacts,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(BorderGuard.choose_artifact)
      } else {
        let artifact_name = lantern_index === -1 ? 'Lantern' : 'Horn'
        let artifact = ClassCreator.create(artifact_name).to_h()

        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_yes_no',
          instructions: `Take ${CardView.render(artifact)}?`,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, artifact)
        turn_event_processor.process(BorderGuard.take_artifact)
      }
    }
  }

  static choose_artifact(game, player_cards, selected_cards) {
    let selected_artifact = selected_cards[0]

    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, player_cards)
    ordered_player_cards.shift()
    _.each(ordered_player_cards, function(other_player_cards) {
      let other_player_artifact_index = _.findIndex(other_player_cards.artifacts, function(other_player_artifact) {
        return other_player_artifact.name === selected_artifact.name
      })
      if (other_player_artifact_index !== -1) {
        other_player_cards.artifacts.splice(other_player_artifact_index, 1)
      }
      PlayerCardsModel.update(game._id, other_player_cards)
    })
    player_cards.artifacts.push(selected_artifact)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> takes ${CardView.render(selected_artifact)}`)
  }

  static take_artifact(game, player_cards, response, artifact) {
    if (response === 'yes') {
      let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, player_cards)
      ordered_player_cards.shift()
      _.each(ordered_player_cards, function(other_player_cards) {
        let other_player_artifact_index = _.findIndex(other_player_cards.artifacts, function(other_player_artifact) {
          return other_player_artifact.name === artifact.name
        })
        if (other_player_artifact_index !== -1) {
          other_player_cards.artifacts.splice(other_player_artifact_index, 1)
        }
        PlayerCardsModel.update(game._id, other_player_cards)
      })
      player_cards.artifacts.push(artifact)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> takes ${CardView.render(artifact)}`)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses not to take ${CardView.render(artifact)}`)
    }
  }

  discard_event(discarder, card_name = 'Border Guard') {
    let discard_card = this
    if (card_name === 'Estate') {
      discard_card = _.find(discarder.player_cards.discarding, function(card) {
        return card.name === 'Estate'
      })
    }
    let turn_event_id = TurnEventModel.insert({
      game_id: discarder.game._id,
      player_id: discarder.player_cards.player_id,
      username: discarder.player_cards.username,
      type: 'choose_yes_no',
      instructions: `Put ${CardView.render(discard_card)} On Top of Deck?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(discarder.game, discarder.player_cards, turn_event_id)
    turn_event_processor.process(BorderGuard.put_on_deck)
  }

  static put_on_deck(game, player_cards, response) {
    if (response === 'yes') {
      let border_guard = player_cards.discarding.pop()
      game.log.push(`<strong>${player_cards.username}</strong> puts ${CardView.render(border_guard)} on top of their deck`)
      delete border_guard.scheme
      delete border_guard.prince
      if (border_guard.misfit) {
        border_guard = border_guard.misfit
      }
      player_cards.deck.unshift(border_guard)
      game.turn.discarded_border_guard = true
    }
  }

}
