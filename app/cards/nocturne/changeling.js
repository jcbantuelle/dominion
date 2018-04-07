Changeling = class Changeling extends Card {

  types() {
    return ['night']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards, player) {
    let card_trasher = new CardTrasher(game, player_cards, 'playing', 'Changeling')
    card_trasher.trash()
    GameModel.update(game._id, game)

    let eligible_cards = _.filter(player_cards.in_play.concat(player_cards.duration).concat(player_cards.permanent), function(in_play_card) {
      return _.find(game.cards, function(game_card) {
        return in_play_card.name === game_card.top_card.name && game_card.source !== 'not_supply'
      })
    })
    eligible_cards = _.uniqBy(eligible_cards, 'name')

    if (_.size(eligible_cards) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        instructions: 'Choose a card to gain:',
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Changeling.gain_card)
    } else if (_.size(eligible_cards) === 1) {
      Changeling.gain_card(game, player_cards, eligible_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_card.name)
    card_gainer.gain_game_card()
  }

  gain_event(gainer) {
    let turn_event_id = TurnEventModel.insert({
      game_id: gainer.game._id,
      player_id: gainer.player_cards.player_id,
      username: gainer.player_cards.username,
      type: 'choose_yes_no',
      instructions: `Exchange ${CardView.render(gainer.gained_card)} for a ${CardView.render(this)}?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(gainer.game, gainer.player_cards, turn_event_id, gainer)
    turn_event_processor.process(Changeling.exchange)
  }

  static exchange(game, player_cards, response, gainer) {
    if (response === 'yes') {
      let gained_card = player_cards[gainer.destination].shift()
      let gained_card_stack = _.find(game.cards, (card) => {
        return card.name === gained_card.stack_name
      })
      gained_card_stack.stack.unshift(gained_card)
      gained_card_stack.top_card = gained_card
      gained_card_stack.count += 1

      let changeling_stack = _.find(game.cards, (card) => {
        return card.stack_name === 'Changeling'
      })
      let gained_changeling = changeling_stack.stack.shift()
      changeling_stack.count -= 1
      if (changeling_stack.count > 0) {
        changeling_stack.top_card = _.head(changeling_stack.stack)
      }
      player_cards.discard.unshift(gained_changeling)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> exchanges ${CardView.render(gained_card)} for ${CardView.render(gained_changeling)}`)
    }
  }

}
