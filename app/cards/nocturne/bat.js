Bat = class Bat extends Card {

  is_purchasable() {
    false
  }

  types() {
    return ['night']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards, player) {
    if (_.size(player_cards.hand) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose up to 2 cards to trash:',
        cards: player_cards.hand,
        minimum: 0,
        maximum: 2
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, player)
      turn_event_processor.process(Bat.trash_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but has no cards in hand`)
    }
  }

  static trash_cards(game, player_cards, selected_cards, player) {
    let trashed_card_count = _.size(selected_cards)

    if (trashed_card_count > 0) {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
      card_trasher.trash()

      let played_bat_index = _.findIndex(player_cards.playing, function(card) {
        return card.id === player.played_card.id
      })
      if (played_bat_index !== -1) {
        let played_bat = player_cards.playing.splice(played_bat_index, 1)[0]
        let bat_stack = _.find(game.cards, (card) => {
          return card.name === 'Bat'
        })
        bat_stack.stack.unshift(played_bat)
        bat_stack.top_card = played_bat
        bat_stack.count += 1
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> returns ${CardView.render(played_bat)}`)

        let vampire_stack = _.find(game.cards, (card) => {
          return card.name === 'Vampire'
        })
        if (vampire_stack.count > 0) {
          let gained_vampire = vampire_stack.stack.shift()
          vampire_stack.count -= 1
          if (vampire_stack.count > 0) {
            vampire_stack.top_card = _.head(vampire_stack.stack)
          }
          player_cards.discard.unshift(gained_vampire)
          game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> takes ${CardView.render(gained_vampire)}`)
        } else {
          game.log.push(`&nbsp;&nbsp;but the ${CardView.render(new Vampire())} pile is empty`)
        }
      } else {
        game.log.push(`&nbsp;&nbsp;but ${CardView.render(new Bat())} is no longer in play`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but does not trash anything`)
    }
  }

}
