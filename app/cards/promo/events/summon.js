Summon = class Summon extends Event {

  coin_cost() {
    return 5
  }

  buy(game, player_cards) {
    let eligible_cards = _.filter(game.cards, function(card) {
      return _.includes(_.words(card.top_card.types), 'action') && card.count > 0 && card.supply && CardCostComparer.coin_less_than(game, card.top_card, 5)
    })

    if (_.size(eligible_cards) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: 'Choose a card to gain:',
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, this.to_h())
      turn_event_processor.process(Summon.gain_card)
    } else if (_.size(eligible_cards) === 1) {
      Summon.gain_card(game, player_cards, eligible_cards, this.to_h())
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  start_turn_event(game, player_cards, summon) {
    let target = _.find(player_cards.aside, (card) => {
      return card.id === summon.target.id
    })
    if (target) {
      let card_player = new CardPlayer(game, player_cards, target)
      card_player.play(true, true, 'aside')
    }
  }

  static gain_card(game, player_cards, selected_cards, summon) {
    let card_gainer = new CardGainer(game, player_cards, 'aside', selected_cards[0].name)
    summon.target = card_gainer.gain()
    player_cards.event_effects.push(summon)
  }
}
