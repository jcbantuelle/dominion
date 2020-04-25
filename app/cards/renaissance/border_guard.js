BorderGuard = class BorderGuard extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    this.source = player_cards.artifacts
    let lantern = this.find_artifact('Lantern')

    let card_count_to_reveal = lantern ? 3 : 2

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;but has no cards in deck`)
    } else {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(card_count_to_reveal)

      let card_mover = new CardMover(game, player_cards)
      if (_.size(player_cards.revealed) === 1) {
        card_mover.move_all(player_cards.revealed, player_cards.hand)
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(player_cards.revealed)} in their hand`)
      } else {
        let gain_artifact = _.size(player_cards.revealed) === card_count_to_reveal && _.every(player_cards.revealed, function(card) {
          return _.includes(_.words(card.types), 'action')
        })

        GameModel.update(game._id, game)
        PlayerCardsModel.update(game._id, player_cards)

        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: game.turn.player._id,
          username: game.turn.player.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: `Choose a card to put in hand:`,
          cards: player_cards.revealed,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, gain_artifact)
        let chosen_card = turn_event_processor.process(BorderGuard.put_card_in_hand)

        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(chosen_card)} in their hand`)
        card_mover.move(player_cards.revealed, player_cards.hand, chosen_card)

        let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
        card_discarder.discard()

        if (gain_artifact) {
          let horn = this.find_artifact('Horn')
          if (lantern && horn) {
            game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> already has ${CardView.render(lantern)} and ${CardView.render(horn)}`)
          } else {
            let artifact_name
            if (lantern || horn) {
              artifact_name = lantern ? 'Horn' : 'Lantern'
            } else {
              GameModel.update(game._id, game)
              PlayerCardsModel.update(game._id, player_cards)
              let artifacts = [(new Lantern()).to_h(), (new Horn()).to_h()]
              let turn_event_id = TurnEventModel.insert({
                game_id: game._id,
                player_id: player_cards.player_id,
                username: player_cards.username,
                type: 'choose_cards',
                player_cards: true,
                instructions: 'Choose which Artifact to take:',
                cards: artifacts,
                minimum: 1,
                maximum: 1
              })
              let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
              artifact_name = turn_event_processor.process(BorderGuard.choose_artifact)
            }

            this.source = game.artifacts
            let artifact = this.find_artifact(artifact_name)
            if (!artifact) {
              let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, player_cards)
              ordered_player_cards.shift()
              _.each(ordered_player_cards, (next_player_cards) => {
                this.next_player_cards = next_player_cards
                this.source = next_player_cards.artifacts
                artifact = this.find_artifact(artifact_name)
                if (artifact) {
                  return false
                }
              })
            }
            card_mover.move(this.source, player_cards.artifacts, artifact)
            if (this.next_player_cards) {
              PlayerCardsModel.update(game._id, this.next_player_cards)
            }
            game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> takes ${CardView.render(artifact)}`)
          }
        }
      }
    }
  }

  find_artifact(artifact_name) {
    return _.find(this.source, (artifact) => {
      return artifact.name === artifact_name
    })
  }

  static put_card_in_hand(game, player_cards, selected_cards) {
    return selected_cards[0]
  }

  static choose_artifact(game, player_cards, selected_cards) {
    return selected_cards[0].name
  }

  discard_event(discarder, border_guard) {
    let turn_event_id = TurnEventModel.insert({
      game_id: discarder.game._id,
      player_id: discarder.player_cards.player_id,
      username: discarder.player_cards.username,
      type: 'choose_yes_no',
      instructions: `Put ${CardView.render(border_guard)} On Top of Deck?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(discarder.game, discarder.player_cards, turn_event_id, border_guard)
    let response = turn_event_processor.process(BorderGuard.put_on_deck)

    if (response === 'yes') {
      let card_mover = new CardMover(discarder.game, discarder.player_cards)
      if (card_mover.move(discarder.player_cards.in_play, discarder.player_cards.deck, border_guard)) {
        discarder.game.log.push(`<strong>${discarder.player_cards.username}</strong> puts ${CardView.render(border_guard)} on top of their deck`)
        discarder.game.turn.discarded_border_guard = true
      }
    }
  }

  static put_on_deck(game, player_cards, response) {
    return response
  }

}
